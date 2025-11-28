import { Typography, Box } from '@mui/material';

const SettingsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600">
        Settings
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Configure system preferences and user settings
      </Typography>
    </Box>
  );
};

export default SettingsPage;
