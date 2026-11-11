
import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
      }}
    >
      <Typography
        variant="h1"
        sx={{ fontSize: { xs: "5rem", md: "7rem" }, fontWeight: 700 }}
      >
        404
      </Typography>

      <Typography sx={{fontWeight: 600}} variant="h5" gutterBottom>
        Page Not Found
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>

      <Button
        component={RouterLink}
        to="/dashboard"
        variant="contained"
      >
        Back to Dashboard
      </Button>
    </Box>
  );
}
