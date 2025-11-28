import { Typography, Box, Paper } from '@mui/material';

const MapPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600">
        Risk Map
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Interactive GIS map with sensor locations and risk zones
      </Typography>
      
      <Paper sx={{ mt: 3, height: 'calc(100vh - 250px)', p: 2 }}>
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="h6" color="textSecondary">
            Map integration with Leaflet/Mapbox - To be implemented
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default MapPage;
