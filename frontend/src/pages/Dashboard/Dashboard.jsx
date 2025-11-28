import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Sensors as SensorsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';
import { fetchActiveAlerts } from '../../store/slices/alertsSlice';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h3" component="div" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: '50%',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.dashboard);
  const { active: activeAlerts } = useSelector((state) => state.alerts);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchActiveAlerts());
  }, [dispatch]);

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
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Real-time monitoring of soil moisture and disaster alerts
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Stat Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sensors"
            value={stats?.sensors?.total || 0}
            icon={<SensorsIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Online Sensors"
            value={stats?.sensors?.online || 0}
            icon={<CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Alerts"
            value={stats?.alerts?.active || 0}
            icon={<WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Critical Alerts"
            value={stats?.alerts?.critical || 0}
            icon={<ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />}
            color="error"
          />
        </Grid>

        {/* Active Alerts List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '400px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Active Alerts
            </Typography>
            {activeAlerts.length === 0 ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="300px"
                flexDirection="column"
              >
                <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  No Active Alerts
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  All systems are operating normally
                </Typography>
              </Box>
            ) : (
              <Box>
                {activeAlerts.slice(0, 5).map((alert) => (
                  <Box
                    key={alert._id}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderLeft: `4px solid`,
                      borderColor:
                        alert.severity === 'critical'
                          ? 'error.main'
                          : alert.severity === 'high'
                          ? 'warning.main'
                          : 'info.main',
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="600">
                      {alert.message?.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {alert.message?.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(alert.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sensor Health */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Sensor Health
            </Typography>
            <Box sx={{ mt: 3 }}>
              {stats?.sensors?.healthDistribution?.map((health) => (
                <Box key={health._id} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" textTransform="capitalize">
                      {health._id || 'Unknown'}
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {health.count}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: 1,
                      height: 8,
                      backgroundColor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(health.count / stats?.sensors?.total) * 100}%`,
                        height: '100%',
                        backgroundColor:
                          health._id === 'healthy'
                            ? 'success.main'
                            : health._id === 'warning'
                            ? 'warning.main'
                            : health._id === 'critical'
                            ? 'error.main'
                            : 'grey.500',
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
