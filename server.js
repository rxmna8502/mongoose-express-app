import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

//Middleware
app.use(express.json());

// MongoDB connection
const mongoUrl = process.env.MONGO_FULL_URI;

try {
  await mongoose.connect(mongoUrl);
  console.log("Connected to MongoDB");
} catch (err) {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1);
}

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: String,
  genre: { type: String, required: true },
  year: { type: Number, required: true },
});

const Movie = mongoose.model("Movie", movieSchema);

//Test route
app.get("/", (req, res) => {
  res.send("Movies server running");
});

// CRUD API endpoints

// Create a new movie - POST /api/v1/movies
app.post("/api/v1/movies", async (req, res) => {
  try {
    const { title, director, genre, year } = req.body;
    if (!title || !genre || !year) {
      return res
        .status(400)
        .json({ message: "Title, genre, and year are required" });
    }
    const newMovie = new Movie({ title, director, genre, year });
    const savedMovie = await newMovie.save();
    res
      .status(201)
      .json({ message: "Movie created successfully", data: savedMovie });
  } catch (err) {
    throw err;
  }
});

// Get all movies - GET /api/v1/movies
// Get movies by genre - GET /api/v1/movies?genre=genreName
app.get("/api/v1/movies", async (req, res) => {
  try {
    const genre = req.query.genre;
    const query = genre ? { genre } : {};
    const movies = await Movie.find(query);
    res
      .status(200)
      .json({ message: "Movies fetched successfully", data: movies });
  } catch (err) {
    throw err;
  }
});

// Get a movie by ID - GET /api/v1/movies/:id
app.get("/api/v1/movies/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res
      .status(200)
      .json({ message: "Movie fetched successfully", data: movie });
  } catch (err) {
    throw err;
  }
});

// Update a movie by ID - PUT /api/v1/movies/:id
app.put("/api/v1/movies/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const { title, director, genre, year } = req.body;
    const updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      { title, director, genre, year },
      { new: true, runValidators: true },
    );
    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res
      .status(200)
      .json({ message: "Movie updated successfully", data: updatedMovie });
  } catch (err) {
    throw err;
  }
});

// Delete a movie by ID - DELETE /api/v1/movies/:id
app.delete("/api/v1/movies/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const deletedMovie = await Movie.findByIdAndDelete(movieId);
    if (!deletedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res
      .status(200)
      .json({ message: "Movie deleted successfully", data: deletedMovie });
  } catch (err) {
    throw err;
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// 404 Not Found middleware
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});