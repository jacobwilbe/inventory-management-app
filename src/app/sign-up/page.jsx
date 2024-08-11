'use client'
import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  CssBaseline,
  Typography,
  Container,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Grid,
  IconButton,
} from '@mui/material';
import { Search, Add, Camera } from '@mui/icons-material';
import { auth } from '@/firebase';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c4dff', // Purple color similar to the ADD ITEM button
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderRadius: 8,
        },
      },
    },
  },
});

const SignUpPage = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginOpen, setOpenLogin] = useState(false);

  const handleLoginOpen = () => setOpenLogin(true);
  const handleLoginClose = () => setOpenLogin(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await signInWithEmailAndPassword(email, password);
      console.log(res);
      setEmail('');
      setPassword('');
      handleLoginClose();
      router.push('/');
    } catch (error) {
      setError(error.message);
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await createUserWithEmailAndPassword(email, password);
      console.log(res);
      setEmail('');
      setPassword('');
      handleClose();
      router.push('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="transparent" elevation={0} >
          <Toolbar sx={{justifyContent: 'center', display: 'flex', alignItems: 'center'}}>
            <Typography variant="h6" component="div" >
              Inventory AI
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#1e1e1e', borderRadius: 2, p: 1 }}>
              <IconButton>
                <Search />
              </IconButton>
              <TextField
                variant="standard"
                placeholder="Search Item"
                InputProps={{ disableUnderline: true }}
                sx={{ ml: 1 }}
              />
            </Box>
            <Box>
              <IconButton sx={{ mr: 1, backgroundColor: '#1e1e1e' }}>
                <Camera />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ backgroundColor: '#7c4dff', color: 'white' }}
              >
                ADD ITEM
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Smart Inventory Management
                  </Typography>
                  <Typography variant="body1">
                    Effortlessly track your items, quantities, and expiration dates. Our AI-powered system helps you stay organized and minimize waste.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Expiration Alerts
                  </Typography>
                  <Typography variant="body1">
                    Never let your items go bad again. Receive timely notifications when items are approaching their expiration date.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              sx={{ mr: 2 }}
              onClick={handleLoginOpen}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              onClick={handleOpen}
            >
              Sign Up
            </Button>
          </Box>
        </Container>
      </Box>

      <Dialog open={loginOpen} onClose={handleLoginClose}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginClose}>Cancel</Button>
          <Button onClick={handleLogin}>Login</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Sign Up</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSignUp}>Sign Up</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default SignUpPage;