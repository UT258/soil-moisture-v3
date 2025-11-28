import { Typography, Box } from '@mui/material';

const SensorDetails = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600">
        Sensor Details
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Detailed sensor information and readings history
      </Typography>
      {/* Add detailed sensor view with charts */}
    </Box>
  );
};

export default SensorDetails;
