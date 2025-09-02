# Event Analytics Platform

## Overview

Event Analytics Platform is a microservices-based system for processing and analyzing events from
Facebook and TikTok platforms. The system includes event ingestion, processing, storage, and
comprehensive reporting capabilities.

### Services

- **Gateway (Port 3000)** - Event ingestion and validation service
- **FB Collector (Port 3010)** - Facebook events processor
- **TTK Collector (Port 3020)** - TikTok events processor
- **Reporter (Port 3001)** - Analytics and reporting service

### Infrastructure

- **NATS JetStream** - Message queue for event processing
- **PostgreSQL** - Event and user data storage
- **Prometheus** - Metrics collection
- **Grafana** - Monitoring dashboards

## Quick Start

### Launch the Platform

```bash
# Start all services
docker-compose up

# Or with rebuild
docker-compose up --build
```

### Verify Services

```bash
# Health checks
curl http://localhost:3000/health/live  # Gateway
curl http://localhost:3001/health/live  # Reporter
curl http://localhost:3010/health/live  # FB Collector
curl http://localhost:3020/health/live  # TTK Collector

# Metrics
curl http://localhost:9090              # Prometheus
curl http://localhost:3000              # Grafana
```

## Reporter API

The Reporter service provides analytics endpoints for generating various reports based on collected
event data.

### Base URL

```
http://localhost:3001/reports
```

### Endpoints

#### 1. Events Report

**GET** `/reports/events`

Returns aggregated event statistics with optional filtering capabilities.

**Query Parameters:** | Parameter | Type | Required | Description |
|-----------|------|----------|-------------| | `from` | Date | Yes | Start date (ISO 8601 format) |
| `to` | Date | Yes | End date (ISO 8601 format) | | `source` | String | No | Event source
(`facebook` or `tiktok`) | | `funnelStage` | String | No | Funnel stage (`top` or `bottom`) | |
`eventType` | String | No | Specific event type (e.g., `ad.view`, `purchase`) |

**Example Request:**

```bash
curl "http://localhost:3001/reports/events?from=2024-01-01&to=2024-01-31&source=facebook&funnelStage=top"
```

**Response Format:**

```json
[
  {
    "source": "facebook",
    "funnelStage": "top",
    "eventType": "ad.view",
    "count": 1250
  },
  {
    "source": "facebook",
    "funnelStage": "top",
    "eventType": "page.like",
    "count": 340
  }
]
```

#### 2. Revenue Report

**GET** `/reports/revenue`

Returns aggregated revenue data from transactional events (e.g., Facebook's `checkout.complete` or
TikTok's `purchase`).

**Query Parameters:** | Parameter | Type | Required | Description |
|-----------|------|----------|-------------| | `from` | Date | Yes | Start date (ISO 8601 format) |
| `to` | Date | Yes | End date (ISO 8601 format) | | `source` | String | No | Event source
(`facebook` or `tiktok`) | | `campaignId` | String | No | Specific campaign ID |

**Example Request:**

```bash
curl "http://localhost:3001/reports/revenue?from=2024-01-01&to=2024-01-31&source=facebook"
```

**Response Format:**

```json
{
  "totalRevenue": 15750.0,
  "revenueByCampaign": [
    {
      "campaignId": "campaign_456",
      "revenue": 8500.0
    },
    {
      "campaignId": "campaign_789",
      "revenue": 7250.0
    }
  ]
}
```

#### 3. Demographics Report

**GET** `/reports/demographics`

Returns user demographic data with platform-specific metrics.

**Query Parameters:** | Parameter | Type | Required | Description |
|-----------|------|----------|-------------| | `from` | Date | Yes | Start date (ISO 8601 format) |
| `to` | Date | Yes | End date (ISO 8601 format) | | `source` | String | No | Event source
(`facebook` or `tiktok`) |

**Example Request:**

```bash
curl "http://localhost:3001/reports/demographics?from=2024-01-01&to=2024-01-31&source=facebook"
```

**Response Format:**

```json
[
  {
    "sourceUserId": "fb_user_123",
    "name": "John Doe",
    "age": 28,
    "gender": "male",
    "country": "USA",
    "city": "New York"
  },
  {
    "sourceUserId": "ttk_user_456",
    "name": "jane_smith",
    "followers": 15000
  }
]
```

**Platform-Specific Fields:**

- **Facebook**: `age`, `gender`, `country`, `city`
- **TikTok**: `followers`

### Response Codes

| Code | Description                      |
| ---- | -------------------------------- |
| 200  | Success                          |
| 400  | Bad Request - Invalid parameters |
| 500  | Internal Server Error            |

### Date Format

All date parameters accept ISO 8601 format:

- `2024-01-01` (Date only)
- `2024-01-01T00:00:00Z` (Full timestamp)
- `2024-01-01T10:30:00+02:00` (With timezone)

## Event Gateway API

### Webhook Endpoint

**POST** `http://localhost:3000/events`

Accepts webhook events from the publisher service.

**Request Body:**

```json
[
  {
    "eventId": "fb_123",
    "timestamp": "2024-01-01T12:00:00Z",
    "source": "facebook",
    "funnelStage": "top",
    "eventType": "ad.view",
    "data": {
      "user": {
        "userId": "fb_user_123",
        "name": "John Doe",
        "age": 28,
        "gender": "male",
        "location": {
          "country": "USA",
          "city": "New York"
        }
      },
      "engagement": {
        "actionTime": "2024-01-01T12:00:00Z",
        "referrer": "newsfeed",
        "videoId": null
      }
    }
  }
]
```

## Environment Configuration

The system supports multiple environments through environment variables:

```bash
# Copy template and configure
cp .env.example .env

# Key variables
EVENT_ENDPOINT=http://gateway:3000/events  # Required by publisher
DATABASE_URL=postgresql://...             # Database connection
NATS_URL=nats://nats:4222                 # Message queue
```

See `ENV_VARIABLES.md` for complete configuration reference.

## Testing

### Unit Tests by Service

```bash
# Test specific service
npm run test:fb-collector
npm run test:ttk-collector
npm run test:gateway
npm run test:reporter

# With watch mode
npm run test:reporter:watch

# With coverage
npm run test:reporter:coverage
```

### All Tests

```bash
# Run all project tests (127 tests)
npm test
```

### Test Coverage

- **FB Collector**: 52 unit tests
- **TTK Collector**: 47 unit tests
- **Reporter**: 28 unit tests
- **Total**: 127 tests passing

## Monitoring

### Health Checks

Each service exposes health endpoints:

- `/health/live` - Liveness probe
- `/health/ready` - Readiness probe with dependency checks
- `/health/metrics` - Prometheus metrics

### Dashboards

Access monitoring at:

- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090

### Metrics

- Gateway: accepted/processed/failed events
- Collectors: processing rates and errors
- Reporter: report generation latency
