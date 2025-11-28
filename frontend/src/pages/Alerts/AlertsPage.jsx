import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { fetchAlerts } from '../../store/slices/alertsSlice';

const AlertsPage = () => {
  const dispatch = useDispatch();
  const { list: alerts, loading } = useSelector((state) => state.alerts);

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  const getSeverityColor = (severity) => {
    const colors = {
      info: 'info',
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error',
    };
    return colors[severity] || 'default';
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
      <Typography variant="h4" gutterBottom fontWeight="600">
        Alerts
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Monitor and manage system alerts
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Alert ID</strong></TableCell>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Severity</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Time</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert._id}>
                <TableCell>{alert.alertId}</TableCell>
                <TableCell>{alert.message?.title}</TableCell>
                <TableCell>{alert.type}</TableCell>
                <TableCell>
                  <Chip
                    label={alert.severity}
                    color={getSeverityColor(alert.severity)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip label={alert.status} size="small" />
                </TableCell>
                <TableCell>{new Date(alert.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Button size="small">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {alerts.length === 0 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
          flexDirection="column"
        >
          <Typography variant="h6" color="textSecondary">
            No alerts found
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AlertsPage;
