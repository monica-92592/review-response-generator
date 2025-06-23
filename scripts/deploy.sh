#!/bin/bash

# Deployment script for AI Review Response Generator
# Usage: ./scripts/deploy.sh [environment] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-$(git rev-parse --short HEAD)}
DEPLOYMENT_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${ENVIRONMENT}_${DEPLOYMENT_TIMESTAMP}"

# Logging
LOG_FILE="./logs/deployment_${ENVIRONMENT}_${DEPLOYMENT_TIMESTAMP}.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Starting pre-deployment checks..."
    
    # Check if we're on the correct branch
    if [ "$ENVIRONMENT" = "production" ] && [ "$(git branch --show-current)" != "main" ]; then
        error "Production deployments must be from the main branch"
    fi
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        warning "There are uncommitted changes in the repository"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Deployment cancelled"
        fi
    fi
    
    # Check if required environment variables are set
    if [ -z "$OPENAI_API_KEY" ] || [ -z "$ANTHROPIC_API_KEY" ] || [ -z "$ENCRYPTION_KEY" ]; then
        error "Required environment variables are not set"
    fi
    
    # Run tests
    log "Running tests..."
    npm run test:coverage || error "Tests failed"
    
    # Run security audit
    log "Running security audit..."
    npm audit --audit-level=moderate || warning "Security audit found issues"
    
    success "Pre-deployment checks completed"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup environment files
    if [ -f ".env.${ENVIRONMENT}.local" ]; then
        cp ".env.${ENVIRONMENT}.local" "$BACKUP_DIR/"
    fi
    
    # Backup Docker volumes (if using Docker)
    if command -v docker &> /dev/null; then
        docker run --rm -v review-response-generator_redis_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/redis_backup.tar.gz -C /data . || warning "Failed to backup Redis data"
    fi
    
    success "Backup created at $BACKUP_DIR"
}

# Build application
build_application() {
    log "Building application for $ENVIRONMENT..."
    
    # Set environment
    export NODE_ENV=$ENVIRONMENT
    
    # Install dependencies
    npm ci --only=production
    
    # Build application
    npm run build
    
    success "Application built successfully"
}

# Deploy application
deploy_application() {
    log "Deploying application to $ENVIRONMENT..."
    
    case $ENVIRONMENT in
        "production")
            deploy_to_production
            ;;
        "staging")
            deploy_to_staging
            ;;
        "development")
            deploy_to_development
            ;;
        *)
            error "Unknown environment: $ENVIRONMENT"
            ;;
    esac
}

deploy_to_production() {
    log "Deploying to production..."
    
    # Deploy to Vercel
    if command -v vercel &> /dev/null; then
        vercel --prod --confirm
    else
        # Fallback to Docker deployment
        docker-compose -f docker-compose.prod.yml up -d --build
    fi
    
    success "Production deployment completed"
}

deploy_to_staging() {
    log "Deploying to staging..."
    
    # Deploy to Vercel (staging)
    if command -v vercel &> /dev/null; then
        vercel --confirm
    else
        # Fallback to Docker deployment
        docker-compose -f docker-compose.prod.yml up -d --build
    fi
    
    success "Staging deployment completed"
}

deploy_to_development() {
    log "Deploying to development..."
    
    # Start development environment
    docker-compose up -d --build
    
    success "Development deployment completed"
}

# Post-deployment checks
post_deployment_checks() {
    log "Running post-deployment checks..."
    
    # Wait for application to be ready
    sleep 10
    
    # Health check
    local health_url=""
    case $ENVIRONMENT in
        "production")
            health_url="https://your-production-domain.com/health"
            ;;
        "staging")
            health_url="https://staging.your-domain.com/health"
            ;;
        "development")
            health_url="http://localhost:3000/health"
            ;;
    esac
    
    if [ -n "$health_url" ]; then
        local max_attempts=30
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -f -s "$health_url" > /dev/null; then
                success "Health check passed"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                error "Health check failed after $max_attempts attempts"
            fi
            
            log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
            sleep 10
            attempt=$((attempt + 1))
        done
    fi
    
    # Run smoke tests
    log "Running smoke tests..."
    npm run test:e2e:smoke || warning "Smoke tests failed"
    
    success "Post-deployment checks completed"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    case $ENVIRONMENT in
        "production")
            if command -v vercel &> /dev/null; then
                vercel rollback
            else
                docker-compose -f docker-compose.prod.yml down
                # Restore from backup
                if [ -d "$BACKUP_DIR" ]; then
                    cp "$BACKUP_DIR/.env.${ENVIRONMENT}.local" ./
                    docker-compose -f docker-compose.prod.yml up -d
                fi
            fi
            ;;
        "staging")
            if command -v vercel &> /dev/null; then
                vercel rollback
            else
                docker-compose -f docker-compose.prod.yml down
                if [ -d "$BACKUP_DIR" ]; then
                    cp "$BACKUP_DIR/.env.${ENVIRONMENT}.local" ./
                    docker-compose -f docker-compose.prod.yml up -d
                fi
            fi
            ;;
        "development")
            docker-compose down
            if [ -d "$BACKUP_DIR" ]; then
                cp "$BACKUP_DIR/.env.${ENVIRONMENT}.local" ./
                docker-compose up -d
            fi
            ;;
    esac
    
    success "Rollback completed"
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove old backups (keep last 5)
    find ./backups -name "${ENVIRONMENT}_*" -type d | sort | head -n -5 | xargs rm -rf 2>/dev/null || true
    
    # Remove old logs (keep last 10)
    find ./logs -name "deployment_${ENVIRONMENT}_*" -type f | sort | head -n -10 | xargs rm -f 2>/dev/null || true
    
    success "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting deployment to $ENVIRONMENT (version: $VERSION)"
    
    # Create necessary directories
    mkdir -p backups logs
    
    # Set up error handling
    trap 'error "Deployment failed. Rolling back..." && rollback' ERR
    
    # Execute deployment steps
    pre_deployment_checks
    backup_current
    build_application
    deploy_application
    post_deployment_checks
    cleanup
    
    success "Deployment to $ENVIRONMENT completed successfully!"
    log "Deployment log: $LOG_FILE"
}

# Run main function
main "$@" 