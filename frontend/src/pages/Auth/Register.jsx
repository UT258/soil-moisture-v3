import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { register, clearError } from '../../store/slices/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organization: '',
    role: 'public',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    const result = await dispatch(register(submitData));
    
    if (register.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            🌱 Soil Moisture Monitor
          </Typography>
          <Typography variant="h6" align="center" gutterBottom>
            Register
          </Typography>

          {(error || localError) && (
            <Alert 
              severity="error" 
              onClose={() => {
                dispatch(clearError());
                setLocalError('');
              }} 
              sx={{ mb: 2 }}
            >
              {error || localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone (optional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Organization (optional)"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            <Typography align="center">
              Already have an account?{' '}
              <Link href="/login" underline="hover">
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
