import { createClient } from "redis";

// ======================================[redisClient]

export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on("error", (err) => console.log("Redis Error", err));
redisClient.on("connect", () => console.log("Successfully connected to Redis server"));


await redisClient.connect();


// ======================================[storeOTP]

export const storeOTP = async (email, otp, expiryInSeconds = 300) => {
    const key = `otp:${email}`;
    await redisClient.set(key, otp, {
        EX: expiryInSeconds
    });
};

// ======================================[getOTP]

export const getOTP = async (email) => {
    const key = `otp:${email}`;
    return await redisClient.get(key);
};

// ======================================[deleteOTP]

export const deleteOTP = async (email) => {
    const key = `otp:${email}`;
    await redisClient.del(key);
};

// ======================================[incrementFailedAttempts]

export const incrementFailedAttempts = async (email, expiryInSeconds = 300) => {
    const key = `attempts:${email}`;
    const currentAttempts = await redisClient.incr(key);
    if (currentAttempts === 1) {
        await redisClient.expire(key, expiryInSeconds);
    }
    return currentAttempts;
};

// ======================================[getFailedAttempts]

export const getFailedAttempts = async (email) => {
    const key = `attempts:${email}`;
    const attempts = await redisClient.get(key);
    return attempts ? parseInt(attempts, 10) : 0;
    
};

// ======================================[resetFailedAttempts]

export const resetFailedAttempts = async (email) => {
    const key = `attempts:${email}`;
    await redisClient.del(key);
};