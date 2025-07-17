import express, { Request, Response } from "express";
import { logger } from "./utils/logger";
import cors from "cors";
import { env } from "./config/envConfig";
import router from "./routes/siswaRoutes";
import { errorHandler } from "./middleware/error";
import cookieParser from "cookie-parser"
import morgan from "morgan";

const app = express();

const corsOptions = {
   origin: 'http://localhost:5173',
   credentials: true
}
app.use(cors(corsOptions));
app.use(express.json())
app.use(morgan("common"));
app.use(cookieParser())
app.use("/siswa", router)


app.get("/", (req: Request, res: Response) => {
   logger.info("someone requested at /");
   res.send("hello from siswa-service");
   
});

app.use(errorHandler)

export default app
