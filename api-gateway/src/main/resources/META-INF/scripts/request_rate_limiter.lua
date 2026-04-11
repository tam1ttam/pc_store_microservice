-- resources/META-INF/scripts/request_rate_limiter.lua
-- Tương thích Redis 7+ (KHÔNG dùng redis.replicate_commands)

local tokens_key = KEYS[1]
local timestamp_key = KEYS[2]

local rate = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

if not now or not rate or not capacity then
  return { 1, -1 }
end

local fill_time = capacity / rate
local ttl = math.floor(fill_time * 2)

-- Dùng MGET để đọc 2 key trong 1 lệnh duy nhất
-- → Tránh hoàn toàn vấn đề "multiple non-deterministic reads"
local results = redis.call("mget", tokens_key, timestamp_key)

local last_tokens = tonumber(results[1])
if last_tokens == nil then
  last_tokens = capacity
end

local last_refreshed = tonumber(results[2])
if last_refreshed == nil then
  last_refreshed = 0
end

local delta = math.max(0, now - last_refreshed)
local filled_tokens = math.min(capacity, last_tokens + (delta * rate))
local requested_tokens = requested or 1
local allowed = filled_tokens >= requested_tokens
local new_tokens = filled_tokens
local allowed_num = 0

if allowed then
  new_tokens = filled_tokens - requested_tokens
  allowed_num = 1
end

-- Dùng MSET + EXPIRE thay vì 2 lần SETEX riêng lẻ
-- Hoặc dùng pipeline qua table
redis.call("setex", tokens_key, ttl, new_tokens)
redis.call("setex", timestamp_key, ttl, now)

return { allowed_num, new_tokens }