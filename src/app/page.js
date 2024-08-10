'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Box, Stack, Typography, Button, Modal, IconButton, TextField, CssBaseline , AppBar, Toolbar, Paper, Icon, FormControl  } from '@mui/material'
import { firestore } from '@/firebase'
import { Analytics } from "@vercel/analytics/react"
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {createTheme, ThemeProvider, styled} from '@mui/material/styles';
import AccountCircle from '@mui/icons-material/AccountCircle';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import RemoveIcon from '@mui/icons-material/Remove';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';  
import StopIcon from '@mui/icons-material/Stop';

const {OpenAI} = require('openai');


import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  color: 'black',
  backgroundColor: 'white',
  border: '2px solid #000',
  borderColor: 'white',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

const today = new Date().toISOString().split('T')[0]






function createData(id, name, quantity, expirationDate) {
  return {
    id,
    name,
    quantity,
    expirationDate
  };
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}


function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}


const headCells = [
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Item Name',
  },
  {
    id: 'quantity',
    numeric: true,
    disablePadding: false,
    label: 'Quantity',
  },
  {
    id: 'expiration',
    numeric: true,
    disablePadding: false,
    label: 'Expires In',
  },
  {
    id: 'actions',
    numeric: true,
    disablePadding: false,
    label: 'Actions',
  }
];


function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="secondary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all items',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  removals: PropTypes.array.isRequired,
  handleDelete: PropTypes.func.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,

};

function SearchBar(props) {
  const { searchQuery, setSearchQuery, handleOpenAdd } = props
  return (
    <Box sx = {{width: '100%', justifyContent: 'flex-start', position: 'relative', flexDirection: 'row'}}>
      <FormControl>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%'}}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid white', // Border color
              height: '56px', // Same height as the TextField
              minWidth: '56px',
              backgroundColor: 'rgba(56,56,56)',
              zIndex: 10
            }}
          >
            <IconButton type="submit" aria-label="search">
              <SearchIcon style={{ fill: "white" }} />
            </IconButton>
          </Box>
          <TextField
            id="search-bar"
            className="text"
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.target.value)}
            label="Search Item"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white', // Outline color
                },
                '&:hover fieldset': {
                  borderColor: 'rgb(56,12,229)', // Outline color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', // Outline color when focused
                },
                backgroundColor: 'rgb(56,56,56)', // Background color
              },
              '& .MuiInputBase-input': {
                color: 'white', // Text color
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'white', // Label color when focused
              },
              minWidth: '85%',
              zIndex: 10
            }}
          />
        </Box>
      </FormControl>
    </Box>
      
  )
}
SearchBar.propTypes = {
  setSearchQuery: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  handleOpenAdd: PropTypes.func.isRequired
}

function EnhancedTableToolbar(props) {
  const { numSelected, removals, handleDelete} = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Inventory
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton
            onClick={() => {
              removals.forEach((item) => {
                handleDelete(item);
              });
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Burger">
          <IconButton>
            <LunchDiningIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})


export default function Home() {
  // We'll add our component logic here
  const [inventory, setInventory] = useState([])
  const [open, setAddOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [expirationDate, setExpirationDate] = useState(today);
  const [quantity, setQuantity] = useState(1);
  const [editOpen, setEditOpen] = useState(false)
  //for authentication
  const [anchorEl, setAnchorEl] = useState(null);
  const [dark, setDark] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const videoRef = useRef(null);

//table functions
  const handleTimeExpire = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expire = new Date(date);
    expire.setHours(0, 0, 0, 0);
    const diff = expire - today;
    return Number(Math.floor(diff / (1000 * 60 * 60 * 24)));
  }


  
  const rows = inventory.map((item, index) => createData(index+1, item.name, item.quantity, item.expirationDate));
 
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('quantity');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (_, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = useMemo(
    () =>
      stableSort(rows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [order, orderBy, page, rows, rowsPerPage],
  );
  
//table functions end

//theme declaration
  const themeOptions = {
    palette: {
      mode: 'dark',
      primary: {
        main: 'rgb(0,0,0)',
      },
      secondary: {
        main: '#6600ff',
      },
    },
  };
  const changeColor = () => {
    if (dark) {
      setDark(false)
    } else {
      setDark(true)
    }

  }
  const theme = createTheme(themeOptions);
  //Theme end

  //search function
  
  //search functions end

  //handle drop doown menu
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  //authentication dropdown
  const handleElClose = () => {
    setAnchorEl(null);
  };

  // fetch inventory data from firestone
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }
  
  useEffect(() => {
    updateInventory()
  }, []);

  //add item to inventory

  const addItem = async (item, quantity, expirationDate) => {
  
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists() && editOpen === false) {
        const data = docSnap.data();
        await setDoc(docRef, {
          quantity: quantity + Number(data.quantity),
          expirationDate: expirationDate
        });
      } else {
        await setDoc(docRef, {
          quantity: Number(quantity),
          expirationDate: expirationDate
        });
      }
  
      await updateInventory();
  };


  //remove item from inventory
  const removeItem = async (item, quantity, expirationDate) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      if (quantity <= 1 ) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1, expirationDate: expirationDate })
      }
    }
    await updateInventory()
  }
   
  //manage the modal state
  const handleOpenAdd = () => setAddOpen(true)
  const handleClose = () => setAddOpen(false)

  const handleOpenEdit = (name, quantity, expirationDate) => () => {
    setItemName(name)
    setQuantity(quantity)
    setExpirationDate(expirationDate)
    setEditOpen(true)
  }
  const handleEditClose = () => {
    setEditOpen(false)  
    setItemName('')
  }
  const handleDelete = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    setItemName('')
    await deleteDoc(docRef)
    await updateInventory()
  }
  
  const [cameraOpen, setCameraOpen] = useState(false);
  const handleCameraOpen = () => setCameraOpen(true);
  const handleCameraClose = () => setCameraOpen(false);


  const [streamResources, setStreamResources] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const [classif, setClass] = useState('');

  const startStreamAnalysis = async () => {
    if (streamResources) return; // Prevent multiple streams

    try {
      setStreamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play(); // Wait for video to start playing
      }

      const intervalId = setInterval(() => {
        if (video) {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          const imageData = canvas.toDataURL('image/jpeg');
         classifyImage(imageData);
        }
      }, 5000);

      setStreamResources({ stream, intervalId });
      setCameraOpen(true);
    } catch (error) {
      console.error("Error starting stream:", error);
      setStreamError("Failed to start video stream. Please check your camera permissions.");
    }
  };

  const endStreamAnalysis = () => {
    if (streamResources) {
      const { stream, intervalId } = streamResources;
      stream.getTracks().forEach(track => track.stop());
      clearInterval(intervalId);
      setStreamResources(null);
      setCameraOpen(false);
    }
  };
  
  async function classifyImage(imageData) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {type: "text", text: 'Classify the item in the image in 1-2 words'},
              {
                type: 'image_url', 
                image_url: {
                  url: imageData
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      });
  
      const classification = response.choices[0].message.content;
      console.log("Classification:", classification);
      setClass(classification);
      // You might want to update state or perform some action with the classification
      // For example: addItem(classification, 1, today);
    } catch (error) {
      console.error("Error classifying image:", error);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Analytics/>

      <CssBaseline />

      <Box sx={{ flexDirection: 'column' , minHeight: '100vh', display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: dark ? theme.palette.background.default : '#f7f2ff',
        color: theme.palette.text.primary,
        transition: 'background-color 0.2s ease-out',
        minWidth: '65%',
        maxWidth: '65%',
        zIndex: 1
      }}>
        <AppBar position="fixed" color='primary' >
          <Toolbar align="center">
            <FormGroup>
              <FormControlLabel
                control={<MaterialUISwitch sx={{ m: 1 }} />}
                onChange={() => changeColor()} 
              />
            </FormGroup>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              Inventory <span style={{ color: '#6600ff' }}>AI</span>
            </Typography>
            <IconButton
              size = "large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit" 
            >
              <AccountCircle />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack spacing={2} mt={2}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent', // Outline color
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(56,12,229)', // Outline color on hover
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white', // Outline color when focused
                    },
                    backgroundColor: 'rgb(56,56,56)', // Background color
                  },
                  '& .MuiInputBase-input': {
                    color: 'white', // Text color
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'transparent', // Label color when focused
                  },
                  minWidth: '85%',
                  zIndex: 10
                }}
              />
              <TextField
                label="Quantity"
                variant="outlined"
                fullWidth
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent', // Outline color
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(56,12,229)', // Outline color on hover
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'transparent', // Outline color when focused
                    },
                    backgroundColor: 'rgb(56,56,56)', // Background color
                  },
                  '& .MuiInputBase-input': {
                    color: 'white', // Text color
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'transparent', // Label color when focused
                  },
                  minWidth: '85%',
                  zIndex: 10
                }}
              />
              <TextField
                label="Expiration Date"
                variant="outlined"
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent', // Outline color
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(56,12,229)', // Outline color on hover
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'transparent', // Outline color when focused
                    },
                    backgroundColor: 'rgb(56,56,56)', // Background color
                  },
                  '& .MuiInputBase-input': {
                    color: 'white', // Text color
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'transparent', // Label color when focused
                  },
                  minWidth: '85%',
                  zIndex: 10
                }}
              />
              <Button
                variant="outlined"
                sx = {{color: theme.palette.secondary.main, borderColor: theme.palette.secondary.main, backgroundColor: 'rgb(56,56,56)'}}
                onClick={() => {
                  addItem(itemName, quantity, expirationDate);
                  setQuantity(1);
                  setExpirationDate(today);
                  setItemName('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        

        <Modal open={editOpen} onClose={handleEditClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description" >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Edit {itemName}
            </Typography>
            <Stack spacing={2} mt={2}>
              <TextField
                label="Quantity"
                variant="outlined"
                fullWidth
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent', // Outline color
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(56,12,229)', // Outline color on hover
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'transparent', // Outline color when focused
                    },
                    backgroundColor: 'rgb(56,56,56)', // Background color
                  },
                  '& .MuiInputBase-input': {
                    color: 'white', // Text color
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'transparent', // Label color when focused
                  },
                  minWidth: '85%',
                  zIndex: 10
                }}
              />
              <TextField
                label="Expiration Date"
                variant="outlined"
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent', // Outline color
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgb(56,12,229)', // Outline color on hover
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'transparent', // Outline color when focused
                    },
                    backgroundColor: 'rgb(56,56,56)', // Background color
                  },
                  '& .MuiInputBase-input': {
                    color: 'white', // Text color
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'transparent', // Label color when focused
                  },
                  minWidth: '85%',
                  zIndex: 10
                }}

              />
              <Button
                variant="outlined"
                sx={{ borderColor: theme.palette.secondary.main, color: theme.palette.secondary.main, backgroundColor: 'rgb(56,56,56)'}}
                onClick={() => {
                  addItem(itemName, quantity, expirationDate);
                  setQuantity(1);
                  setExpirationDate('');
                  setItemName('');
                  handleEditClose();
                }}
              >
                Done
              </Button>
            </Stack>
          </Box>
        </Modal>

        
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 3,
            marginTop: '10%',
            marginBottom: '10%'
          }}
        >
          <Box
            sx ={{flexDirection: 'row', display: 'flex', width: '100%', justifyContent: 'space-between'}}
          >
            <SearchBar setSearchQuery={setSearchQuery} searchQuery={searchQuery} handleOpenAdd={handleOpenAdd} />
            <Box
              sx = {{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%'
              }} 
            >
              <Box sx={{height:'100%', marginRight: '2px'}}>
                <Tooltip title="Add with AI!"sx={{height:'100%'}}>
                  <Button variant="contained" color='secondary' onClick={() => handleCameraOpen()} startIcon={<AddAPhotoIcon />}/>
                </Tooltip>
                <Modal
                  open={cameraOpen}
                  onClose={endStreamAnalysis}
                  aria-labelledby="camera-modal-title"
                  aria-describedby="camera-modal-description"
                >
                  <Box sx={style}>
                    <Typography id="camera-modal-title" variant="h6" component="h2">
                      Video Stream
                    </Typography>
                    {streamError && (
                      <Typography color="error">{streamError}</Typography>
                    )}
                    <video
                      ref={videoRef}
                      style={{ width: '100%', height: 'auto', maxHeight: '300px', backgroundColor: 'black' }}
                      autoPlay
                      playsInline
                    />
                    {!streamResources ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={startStreamAnalysis}
                        startIcon={<PlayArrowIcon />}
                      >
                        Start Stream Analysis
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={endStreamAnalysis}
                        startIcon={<StopIcon />}
                      >
                        Stop Stream Analysis
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => addItem(classif, 1, today)}
                    >
                      Add {classif}
                    </Button>

                  </Box>
                </Modal>
              </Box>
              <Button variant="contained" color="secondary" onClick={handleOpenAdd} startIcon={<AddIcon />}>
                Add Item
              </Button>
            </Box>
          </Box>
          <Box sx={{ width: '100%', flexGrow: 1}}>
            <Paper sx={{ width: '100%', mb: 2, elevation :6}}>
              <EnhancedTableToolbar numSelected={selected.length} removals={selected} handleDelete={handleDelete}/>
              <TableContainer>
                <Table
                  sx={{ minWidth: 750 }}
                  aria-labelledby="tableTitle"
                  size={dense ? 'small' : 'medium'}
                >
                  <EnhancedTableHead
                    numSelected={selected.length}
                    order={order}
                    orderBy={orderBy}
                    onSelectAllClick={handleSelectAllClick}
                    onRequestSort={handleRequestSort}
                    rowCount={rows.length}
                  />
                  <TableBody>
                    {(
                      searchQuery === '' 
                        ? visibleRows 
                        : visibleRows.filter((row) => row.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    ).map((row, index) => {
                      const isItemSelected = isSelected(row.name);
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, row.name)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.id}
                          selected={isItemSelected}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="secondary"
                              checked={isItemSelected}
                              inputProps={{
                                'aria-labelledby': labelId,
                              }}
                            />
                          </TableCell>
                          <TableCell
                            component="th"
                            id={labelId}
                            scope="row"
                            padding="none"
                          >
                            {row.name}
                          </TableCell>
                          <TableCell align="right">{row.quantity}</TableCell>
                          <TableCell align="right">{handleTimeExpire(row.expirationDate)} Days</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(row.name, row.quantity, row.expirationDate)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => removeItem(row.name, row.quantity, row.expirationDate)}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {emptyRows > 0 && (
                      <TableRow
                        style={{
                          height: (dense ? 33 : 53) * emptyRows,
                        }}
                      >
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
            <FormControlLabel
              control={<Switch checked={dense} onChange={handleChangeDense} />}
              label={
                dark ? (
                  <span style={{ color: 'white' }}>Shrink</span>
                ) : (
                  <span style={{ color: 'black' }}>Shrink</span>
                )
              }
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>

      
  )
}

