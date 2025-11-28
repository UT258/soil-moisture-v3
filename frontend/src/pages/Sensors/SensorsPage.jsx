import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Battery20 as LowBatteryIcon,
  BatteryFull as FullBatteryIcon,
  SignalCellular4Bar as StrongSignalIcon,
  SignalCellularAlt as WeakSignalIcon,
} from '@mui/icons-material';
import { fetchSensors } from '../../store/slices/sensorsSlice';

const SensorsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: sensors, loading } = useSelector((state) => state.sensors);

  useEffect(() => {
    dispatch(fetchSensors());
  }, [dispatch]);

  const getHealthColor = (health) => {
    const colors = {
      healthy: 'success',
      warning: 'warning',
      critical: 'error',
      offline: 'default',
    };
    return colors[health] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="600">
            Sensors
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage and monitor all soil moisture sensors
          </Typography>
        </Box>
        <Button variant="contained" color="primary">
          Add New Sensor
        </Button>
      </Box>

      <Grid container spacing={3}>
        {sensors.map((sensor) => (
          <Grid item xs={12} sm={6} md={4} key={sensor._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h6" fontWeight="600">
                    {sensor.name}
                  </Typography>
                  <Chip
                    label={sensor.status.health}
                    color={getHealthColor(sensor.status.health)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  ID: {sensor.sensorId}
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Type: {sensor.type}
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Terrain: {sensor.location.terrain}
                </Typography>

                <Box display="flex" gap={2} mt={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {sensor.status.battery?.level > 50 ? (
                      <FullBatteryIcon fontSize="small" color="success" />
                    ) : (
                      <LowBatteryIcon fontSize="small" color="warning" />
                    )}
                    <Typography variant="caption">
                      {sensor.status.battery?.level || 0}%
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={0.5}>
                    {sensor.status.signal?.quality === 'good' ||
                    sensor.status.signal?.quality === 'excellent' ? (
                      <StrongSignalIcon fontSize="small" color="success" />
                    ) : (
                      <WeakSignalIcon fontSize="small" color="warning" />
                    )}
                    <Typography variant="caption">
                      {sensor.status.signal?.quality || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                  Last seen:{' '}
                  {sensor.status.lastSeen
                    ? new Date(sensor.status.lastSeen).toLocaleString()
                    : 'Never'}
                </Typography>
              </CardContent>

              <CardActions>
                <Button size="small" onClick={() => navigate(`/sensors/${sensor._id}`)}>
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {sensors.length === 0 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
          flexDirection="column"
        >
          <Typography variant="h6" color="textSecondary">
            No sensors found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Add your first sensor to start monitoring
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SensorsPage;
