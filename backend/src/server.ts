import app from "../api/index";

const PORT = process.env.PORT ?? 8080;

app.listen(PORT, () => {
  console.log(`🐑 monee backend running on port ${PORT}`);
});
