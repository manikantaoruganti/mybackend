# Temporal Contract Engine (TCE)

**Deterministic Event-Sourced Contract Execution Platform**

---

## Why This Project Exists

Most production systems that manage money, compliance workflows, or critical business commitments share a structural weakness: they overwrite state.

A traditional CRUD architecture updates a record in place. That works fine for a blog post. It fails for a payment settlement, a subscription renewal, or a compliance approval — scenarios where the question is not just *what is the current state* but *how did we get here, and can we prove it?*

When a network timeout causes a client to retry a request, the system must recognize the duplicate and respond safely. When an execution fails midway through a multi-step workflow, the system must recover deterministically. When a regulator asks for an audit trail, the system must reconstruct every decision, in order, without ambiguity.

**Temporal Contract Engine was built to answer those requirements directly.**

TCE models business commitments as first-class, time-bound contracts with an immutable event log at their core. Every state transition — creation, rule evaluation, execution, failure, cancellation — is preserved as an ordered event. State is never overwritten; it is derived from history. This makes the system replayable, auditable, and recoverable by design — not by accident.

The architecture draws on patterns used in financial infrastructure, workflow orchestration, and settlement platforms: event sourcing, optimistic locking, idempotent APIs, distributed scheduling, failure isolation via dead letter queues, and Prometheus-instrumented observability.

---

## At A Glance

| Property | Value |
|---|---|
| **Project Type** | Distributed Contract Execution Platform |
| **Primary Language** | Java 21 |
| **Framework** | Spring Boot 3 |
| **Architecture Style** | Event-Sourced, Service-Oriented |
| **Persistence Strategy** | Immutable Event Log + Projected State (PostgreSQL) |
| **Concurrency Strategy** | Optimistic Locking (version-based conflict detection) |
| **Messaging Layer** | Kafka / Redpanda |
| **Coordination Layer** | Redis (idempotency, distributed locks) |
| **Observability Stack** | Prometheus + Micrometer |
| **Deployment Model** | Containerized (Docker) |

---

## System Capabilities

```
✓ Event-Sourced State Management
✓ Replayable Contract State Reconstruction
✓ Optimistic Locking for Concurrency Control
✓ Idempotent Request Processing
✓ Rule-Based Execution Engine (DSL-driven)
✓ Distributed Scheduling
✓ Automatic Retry with Backoff
✓ Dead Letter Queue Isolation
✓ Kafka Event Streaming
✓ Redis Coordination
✓ Prometheus Metrics + Micrometer Instrumentation
✓ Full Execution Audit Trail
✓ State Consistency Verification via Replay
```

---

## What Makes This Different From Typical CRUD Projects

| Dimension | Traditional CRUD Application | Temporal Contract Engine |
|---|---|---|
| **State Management** | Overwrite in place; prior state is lost | Append immutable events; state is derived from history |
| **Auditability** | Limited to `updated_at` timestamps | Full ordered event log per contract |
| **Replay** | Not possible; no event history | Deterministic replay from event store |
| **Duplicate Requests** | Often creates duplicate records | Idempotency keys prevent double-processing |
| **Concurrent Writes** | Last write wins; silent data loss | Optimistic locking surfaces conflicts explicitly |
| **Partial Failure Recovery** | Manual intervention; unclear state | Retry engine + dead letter queue for isolation |
| **Rule Evaluation** | Hardcoded business logic | Configurable rule DSL evaluated at execution time |
| **Observability** | Basic request logging | Structured metrics per operation type (Prometheus) |
| **Failure Transparency** | Errors may be swallowed silently | Every failure is recorded, categorized, and retrievable |

A CRUD system tells you where things are. TCE tells you where things are, how they got there, and how to get back to any prior state.

---

## Engineering Challenges Solved

### 1. Duplicate Request Processing

| | |
|---|---|
| **Challenge** | Clients retry requests on network timeout, creating duplicate contract executions |
| **Risk** | Double charges, double settlements, financial inconsistency |
| **Solution** | Idempotency keys stored in Redis; duplicate requests return the original response without re-executing |

### 2. Concurrent Execution Conflicts

| | |
|---|---|
| **Challenge** | Multiple threads or distributed nodes attempt to transition the same contract simultaneously |
| **Risk** | Inconsistent state; one update silently overwrites another |
| **Solution** | Optimistic locking via version fields; conflicting writes are rejected with a clear error, not silently discarded |

### 3. Lost Historical State

| | |
|---|---|
| **Challenge** | Traditional systems update records in place, permanently destroying prior state |
| **Risk** | No audit trail; impossible to reconstruct what happened during disputes or investigations |
| **Solution** | Event sourcing — every state transition appends an immutable event; current state is always derivable from history |

### 4. Partial Failure Mid-Execution

| | |
|---|---|
| **Challenge** | Execution begins, an external call fails, and the system is left in an ambiguous intermediate state |
| **Risk** | Contracts stuck in EXECUTING with no recovery path |
| **Solution** | Retry engine with configurable backoff; persistently failed executions are moved to the dead letter queue for isolation and investigation |

### 5. Rule Evaluation Coupling

| | |
|---|---|
| **Challenge** | Business rules hardcoded into application logic require deploys to change |
| **Risk** | Slow iteration; inflexible compliance logic |
| **Solution** | Rule DSL with configurable condition expressions and action payloads, stored per contract and evaluated at execution time |

### 6. State Reconstruction Correctness

| | |
|---|---|
| **Challenge** | After a failure, projected state may diverge from the actual event history |
| **Risk** | Silent corruption; contracts that report incorrect status |
| **Solution** | Replay engine that reconstructs expected state from events and compares against projected state, surfacing any discrepancy |

### 7. Distributed Retry Coordination

| | |
|---|---|
| **Challenge** | Multiple scheduler nodes may pick up the same contract for retry simultaneously |
| **Risk** | Duplicate execution of supposedly-retried contracts |
| **Solution** | Redis-based coordination ensures single-node ownership of retry claims |

---

## Architecture

```
Client
 │
 ▼
REST API  ──────────────► Idempotency Filter (Redis)
 │
 ▼
Controllers
 │
 ▼
Services
 │
 ├──────────────► PostgreSQL (Contracts, Rules, Events, Execution Logs)
 │
 ├──────────────► Redis (Idempotency Keys, Distributed Locks)
 │
 ├──────────────► Event Store (Immutable Append Log)
 │
 ├──────────────► Scheduler (Deadline-aware polling)
 │
 └──────────────► Kafka / Redpanda
                        │
                        ▼
                 Event Consumers
                 (async processing, downstream notifications)
```

### Architecture Highlights

**Event Sourcing** was selected because the domain requires auditability and replayability that projected-state-only systems cannot provide. The tradeoff is increased storage and query complexity — reading current state requires projection over the event log — but this is acceptable given the audit requirements.

**Replay Engine** enables state verification independent of the running projection. The tradeoff is that replay is computationally heavier than a direct state read, so it is scoped to administrative and diagnostic paths rather than the hot execution path.

**Optimistic Locking** was chosen over pessimistic locking to avoid holding database row locks under distributed scheduling conditions. The tradeoff is that conflicts must be explicitly handled by callers, which requires more careful error propagation.

**Kafka** decouples event publication from execution, allowing downstream consumers to process CONTRACT_EXECUTED or EXECUTION_FAILED events independently without blocking the execution path. The tradeoff is operational complexity: Kafka requires its own availability guarantees.

**Redis** provides sub-millisecond idempotency key lookup and distributed lock coordination. The tradeoff is that Redis is an additional infrastructure dependency with its own failure modes.

**Prometheus + Micrometer** was selected over application-level logging alone because counters like `execution_failure_count_total` are actionable signals that can drive alerts and SLOs without requiring log parsing.

---

## Production-Oriented Design Decisions

### Idempotency
Every mutating request accepts an `Idempotency-Key` header. The key is checked against Redis before any processing begins. If a matching key exists, the original response is returned without re-execution. This protects against client retries on network timeout — one of the most common sources of duplicate processing in financial systems.

### Retry with Backoff
Transient failures during execution trigger automatic retries with configurable backoff intervals. Retry state is tracked in the execution log, providing full visibility into how many attempts were made before success or escalation.

### Dead Letter Queue
Executions that exhaust their retry budget are moved to the dead letter store rather than silently discarded. The DLQ is queryable via API, enabling operational teams to investigate, remediate, and selectively replay failed contracts without data loss.

### Audit Log (Event Store)
The event store is append-only. No event is updated or deleted after insertion. This provides a tamper-evident record of every significant transition across the contract lifecycle — a requirement in compliance-sensitive domains.

### Prometheus Metrics
Key operational signals are instrumented as named counters:
- `contract_creation_count_total`
- `execution_success_count_total`
- `execution_failure_count_total`
- `scheduler_backlog`

These metrics are designed to feed alerting rules and SLO dashboards without requiring log parsing.

### Replayability
The replay engine can reconstruct projected state from the event log at any point in time. This enables correctness verification after a system failure and is the foundation for event-based debugging — replay to the point of failure and inspect state without guesswork.

---

## Distributed Systems Concepts Demonstrated

| Concept | Description |
|---|---|
| **Event Sourcing** | State is derived from an ordered, immutable event log rather than stored directly |
| **Optimistic Locking** | Concurrent writes are detected via version comparison; conflicts are surfaced rather than silently overwritten |
| **Idempotency** | Repeated requests with the same key produce the same result without side-effect duplication |
| **Retry Backoff** | Transient failures trigger scheduled re-attempts with increasing delay intervals |
| **Dead Letter Queues** | Permanently failed executions are isolated for inspection without polluting the main execution path |
| **Replayability** | State can be reconstructed deterministically from event history, enabling recovery and verification |
| **Auditability** | Every business action is recorded with timestamp, type, and payload — queryable per contract |
| **Consistency Verification** | Replay engine compares reconstructed state against projected state to detect divergence |
| **Event Streaming** | Kafka publishes domain events asynchronously to decouple downstream consumers from the execution path |
| **Distributed Scheduling** | Contracts are evaluated against time-based eligibility rules by a scheduler that coordinates via Redis |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3 |
| Database | PostgreSQL |
| Cache / Coordination | Redis |
| Messaging | Kafka / Redpanda |
| Monitoring | Prometheus |
| Metrics Instrumentation | Micrometer |
| API Documentation | Swagger / OpenAPI |
| Build Tool | Maven |
| Containers | Docker |

---

## Domain Model

### Contract
Represents a delayed, rule-bound commitment.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Unique identifier |
| `name` | String | Human-readable label |
| `description` | String | Business context |
| `status` | Enum | Current lifecycle state |
| `effectiveDate` | Timestamp | When the contract becomes eligible |
| `expirationDate` | Timestamp | When the contract expires |
| `creationDate` | Timestamp | When the contract was created |
| `lastModifiedDate` | Timestamp | Last state transition timestamp |

### Contract Lifecycle

```
PENDING ──► ELIGIBLE ──► EXECUTING ──► COMPLETED
                                  └──► FAILED ──► (Dead Letter)
PENDING ──► CANCELLED
```

### Rule

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Unique identifier |
| `contractId` | UUID | Associated contract |
| `conditionExpression` | String | DSL expression (e.g., `balance > 1000`) |
| `actionPayload` | JSON | Outcome payload if condition passes |
| `priority` | Integer | Evaluation order |

### EventStore

| Field | Type | Description |
|---|---|---|
| `eventId` | UUID | Unique event identifier |
| `aggregateId` | UUID | Contract or entity ID |
| `aggregateType` | String | Entity type |
| `eventType` | String | Event classification |
| `payload` | JSON | Event data |
| `occurredAt` | Timestamp | Event time |

### ExecutionLog

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Log entry ID |
| `contractId` | UUID | Associated contract |
| `executionTimestamp` | Timestamp | When execution was attempted |
| `status` | Enum | SUCCESS or FAILURE |
| `details` | String | Outcome description |

### DeadLetterExecution

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Record ID |
| `contractId` | UUID | Associated contract |
| `failedAt` | Timestamp | Time of terminal failure |
| `errorMessage` | String | Failure reason |
| `stackTrace` | String | Full diagnostic trace |

---

## API Reference

### Health

#### `GET /health`
Basic liveness check.
```json
{ "status": "UP" }
```

#### `GET /actuator/health`
Detailed readiness check across database, Redis, and Kafka.

#### `GET /actuator/prometheus`
Returns Prometheus-formatted metrics including:
- `contract_creation_count_total`
- `execution_success_count_total`
- `execution_failure_count_total`
- `scheduler_backlog`

---

### Contracts

#### `GET /api/v1/contracts`
Returns all contracts.
```json
[
  {
    "id": "uuid",
    "name": "Contract",
    "status": "PENDING"
  }
]
```

#### `POST /api/v1/contracts`
Creates a new contract. Generates a `CONTRACT_CREATED` event.

**Headers**
```
Content-Type: application/json
Idempotency-Key: unique-key-123
```

**Request**
```json
{
  "name": "Premium Subscription Renewal",
  "description": "Monthly renewal workflow",
  "effectiveDate": "2030-01-01T00:00:00Z",
  "expirationDate": "2031-01-01T00:00:00Z",
  "ruleIds": []
}
```

**Response**
```json
{
  "id": "contract-uuid",
  "status": "PENDING"
}
```

#### `GET /api/v1/contracts/{id}`
Retrieves a single contract by ID.

#### `POST /api/v1/contracts/{id}/execute`
Triggers execution. Evaluates associated rules and transitions contract state.

**Request**
```json
{
  "balance": 1500,
  "risk_score": 20
}
```

**Generated Events:** `CONTRACT_EXECUTED` or `EXECUTION_FAILED`

#### `POST /api/v1/contracts/{id}/cancel`
Cancels a contract. Generates a `CONTRACT_CANCELLED` event.

#### `GET /api/v1/contracts/{id}/events`
Returns the full event history for a contract.
```json
[
  { "eventType": "CONTRACT_CREATED" },
  { "eventType": "CONTRACT_EXECUTED" }
]
```

#### `GET /api/v1/contracts/{id}/execution-logs`
Returns execution attempt history.
```json
[
  {
    "status": "SUCCESS",
    "details": "Execution completed"
  }
]
```

---

### Rules

#### `POST /api/v1/rules`
Creates a rule and associates it with a contract. Generates a `RULE_CREATED` event.
```json
{
  "contractId": "contract-uuid",
  "name": "Balance Validation",
  "description": "Approve only high-balance accounts",
  "conditionExpression": "balance > 1000",
  "actionPayload": "{\"approved\":true}",
  "priority": 1
}
```

#### `GET /api/v1/rules/{id}`
Retrieves a rule by ID.

---

### Admin

#### `POST /admin/replay/{contractId}`
Replays contract event history and compares reconstructed state against projected state.
```json
{
  "contractId": "contract-id",
  "consistent": true,
  "discrepancies": []
}
```

#### `GET /admin/dead-letters`
Returns all permanently failed executions.
```json
[
  {
    "contractId": "uuid",
    "errorMessage": "Failure details"
  }
]
```

---

## End-to-End Validation Workflow

| Step | Method | Endpoint | Purpose |
|---|---|---|---|
| 1 | GET | `/actuator/health` | Verify all components healthy |
| 2 | POST | `/api/v1/contracts` | Create contract; capture `CONTRACT_ID` |
| 3 | GET | `/api/v1/contracts/{CONTRACT_ID}` | Verify contract created |
| 4 | POST | `/api/v1/rules` | Create rule; capture `RULE_ID` |
| 5 | GET | `/api/v1/rules/{RULE_ID}` | Verify rule created |
| 6 | POST | `/api/v1/contracts/{CONTRACT_ID}/execute` | Execute contract against rules |
| 7 | GET | `/api/v1/contracts/{CONTRACT_ID}/events` | Confirm event log contains `CONTRACT_CREATED`, `RULE_CREATED`, `CONTRACT_EXECUTED` |
| 8 | GET | `/api/v1/contracts/{CONTRACT_ID}/execution-logs` | Confirm execution recorded |
| 9 | POST | `/admin/replay/{CONTRACT_ID}` | Verify replay consistency: `"consistent": true` |
| 10 | GET | `/actuator/prometheus` | Confirm metric counters incremented |

---

## Skills Demonstrated

### Backend Engineering
Stateful lifecycle management, REST API design, transactional service layers, persistence modeling with PostgreSQL, and containerized deployment.

### System Design
Separation of concerns across controllers, services, event stores, and schedulers. Domain model grounded in real business constraints. Clear API boundaries with documented contracts.

### Distributed Systems
Event sourcing for append-only state management, optimistic locking for concurrent write safety, Redis for distributed coordination, Kafka for decoupled event propagation.

### Concurrency
Version-based conflict detection via optimistic locking. Distributed lock acquisition via Redis to prevent scheduler collision on shared contract records.

### Data Modeling
Immutable event log as the authoritative record. Projected state as a derived read model. Separate execution log and dead letter store as operational artifacts.

### Observability
Named Prometheus counters instrumented at key operation boundaries (creation, success, failure, backlog). Metrics designed to be actionable — suitable for SLO alerting without log parsing.

### Reliability Engineering
Retry engine for transient failure recovery. Dead letter queue for terminal failure isolation. Idempotency layer for duplicate request protection. Each layer addresses a distinct failure mode.

### Operational Readiness
Health endpoint with per-dependency checks. Admin APIs for replay and dead letter inspection. Full execution history queryable per contract. System behavior is observable and diagnosable in production.

---

## Project Maturity

### Implemented
- Contract lifecycle state machine (PENDING → ELIGIBLE → EXECUTING → COMPLETED / FAILED / CANCELLED)
- Immutable event store with full event history per contract
- Rule DSL with configurable condition expressions
- Idempotent contract creation via Redis-backed idempotency keys
- Optimistic locking for concurrent write protection
- Execution log with per-attempt status and detail capture
- Dead letter queue for terminal execution failures
- Replay engine for state consistency verification
- Prometheus metrics for creation, success, failure, and backlog
- Kafka event publication for CONTRACT_CREATED, CONTRACT_EXECUTED, EXECUTION_FAILED, CONTRACT_CANCELLED, RULE_CREATED
- Docker-based containerized deployment

### Partially Implemented
- Scheduler: deadline-aware polling is in place; distributed lock coordination via Redis is wired but not fully hardened under concurrent scheduler instances
- Rule DSL: condition expression parsing implemented for basic numeric comparisons; complex boolean combinations and string predicates are limited

### Future Enhancements
- Multi-node scheduler with leader election for high availability
- Rule DSL expanded to support compound conditions, temporal predicates, and external data lookups
- Event schema versioning for backward-compatible event evolution
- Streaming replay via Kafka for event-driven state projection updates
- Compensation workflow support (saga pattern) for multi-contract rollback scenarios
- Tenant isolation for multi-tenant deployment

---

## License

Apache License 2.0
