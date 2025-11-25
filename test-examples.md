# Test Examples for Log Formatter

Use these examples to test the application:

## JSON Example

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "message": "User login successful",
  "user_id": 12345,
  "ip_address": "192.168.1.100",
  "metadata": {
    "browser": "Chrome",
    "version": "120.0.0",
    "os": "macOS"
  }
}
```

## JSON Lines Example

```json
{"ts":"2024-01-15T10:00:00Z","level":"INFO","msg":"Request started","req_id":"abc-123"}
{"ts":"2024-01-15T10:00:01Z","level":"INFO","msg":"Database query","duration_ms":45,"req_id":"abc-123"}
{"ts":"2024-01-15T10:00:02Z","level":"INFO","msg":"Request completed","status":200,"req_id":"abc-123"}
```

## Apache Log Example

```
192.168.1.100 - - [15/Jan/2024:10:30:00 +0000] "GET /api/users HTTP/1.1" 200 2326 "https://example.com" "Mozilla/5.0"
192.168.1.101 - - [15/Jan/2024:10:30:05 +0000] "POST /api/login HTTP/1.1" 200 1543 "https://example.com" "Mozilla/5.0"
192.168.1.102 - - [15/Jan/2024:10:30:10 +0000] "GET /api/products HTTP/1.1" 404 183 "https://example.com" "Mozilla/5.0"
```

## Kubernetes Describe Example

```
Name:         my-application-pod
Namespace:    production
Labels:       app=my-app
              version=v1.2.3
Annotations:  kubernetes.io/created-by: deployment-controller
Status:       Running
IP:           10.244.1.45
Containers:
  app:
    Image:         myapp:v1.2.3
    Port:          8080/TCP
    State:         Running
      Started:     Mon, 15 Jan 2024 10:00:00 +0000
    Ready:         True
    Restart Count: 0
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  5m    default-scheduler  Successfully assigned production/my-application-pod to node-1
  Normal  Pulled     5m    kubelet            Container image "myapp:v1.2.3" already present on machine
  Normal  Created    5m    kubelet            Created container app
  Normal  Started    5m    kubelet            Started container app
```

## Plain Text Example

```
2024-01-15 10:30:00 INFO Starting application server port=8080 env=production
2024-01-15 10:30:01 INFO Database connection established host=db.example.com
2024-01-15 10:30:02 INFO Cache initialized type=redis size=1000
2024-01-15 10:30:03 INFO HTTP server listening address=0.0.0.0:8080
2024-01-15 10:30:15 WARN Slow query detected duration=1523ms query="SELECT * FROM users"
2024-01-15 10:30:20 ERROR Failed to send notification user_id=123 error="connection timeout"
```

## Expected Outputs

### JSON to JSON Lines (Auto)
Input: JSON object
Output: Single line compact JSON with nulls removed

### Apache Logs to JSON Lines
Input: Apache log lines
Output:
```json
{"ip":"192.168.1.100","ts":"2024-01-15T10:30","req":"GET /api/users","st":"200","sz":"2326"}
{"ip":"192.168.1.101","ts":"2024-01-15T10:30","req":"POST /api/login","st":"200","sz":"1543"}
```

### Kubernetes to Compact JSON
Input: K8s describe output
Output: Nested JSON structure with only essential fields

### Plain Text to JSON Lines
Input: Plain text logs
Output:
```json
{"ts":"2024-01-15 10:30:00","lvl":"INFO","data":{"port":"8080","env":"production"},"msg":"Starting application server"}
{"ts":"2024-01-15 10:30:01","lvl":"INFO","data":{"host":"db.example.com"},"msg":"Database connection established"}
```
