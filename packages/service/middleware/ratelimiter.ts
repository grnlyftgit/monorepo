import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 60000,  // 1 minute
    limit: 10, // Limit each IP to 60 requests per windowMs
    standardHeaders: 'draft-8', // Enable standard rate limit headers
    legacyHeaders: false, // Disable the legacy headers
    message: {
        error: "Too many requests, please try again later."
    }
})

export default limiter;