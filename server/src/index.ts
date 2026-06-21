import cors from "cors";
import express from "express";

import { busStopsRouter } from "./routes/busStops";
import { restaurantsRouter } from "./routes/restaurants";
import { touristSpotsRouter } from "./routes/touristSpots";
import { usersRouter } from "./routes/users";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/bus-stops", busStopsRouter);
app.use("/api/restaurants", restaurantsRouter);
app.use("/api/tourist-spots", touristSpotsRouter);
app.use("/api/users", usersRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
