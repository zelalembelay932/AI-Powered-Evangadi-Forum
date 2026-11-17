import dotenv from "dotenv";

dotenv.config();

const { default: express } = await import("express");
const { default: cors } = await import("cors");
const { db } = await import("./db/config.js");
const { default: mainRouter } = await import("./src/api/routes.js");

const app = express();
const PORT = process.env.PORT || 3777;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/api", mainRouter);
const startServer = async () => {
  try {
    const connection = await db.getConnection();

    console.log("Database connection established successfully!");

    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
