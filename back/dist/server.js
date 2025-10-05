"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app_1.app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/health`);
});
