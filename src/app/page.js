'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, IconButton, TextField, Card, CardContent, CssBaseline   } from '@mui/material'
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import { firestore } from '@/firebase'
import { Analytics } from "@vercel/analytics/react"
import Autocomplete from '@mui/material/Autocomplete';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Css } from '@mui/icons-material';
import CardActions from '@mui/material/CardActions';
import {createTheme, ThemeProvider} from '@mui/material/styles';

export const themeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#5fc5a4',
    },
    secondary: {
      main: '#00f5d1',
    },
  },
};

const theme = createTheme(themeOptions);

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
  backgroundColor: 'black',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}



export default function Home() {
  // We'll add our component logic here
  const [inventory, setInventory] = useState([])
  const [open, setAddOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expirationDate, setExpirationDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [editOpen, setEditOpen] = useState(false)

  const handleSearch = async () => {
    setItemName(searchQuery)
    setQuantity(inventory.find(item => item.name === searchQuery).quantity)
    setExpirationDate(inventory.find(item => item.name === searchQuery).expirationDate)
    setEditOpen(true)
    setSearchQuery('')
  }

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
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists() && editOpen === false) {
      const data  = docSnap.data()
      await setDoc(docRef, {quantity: quantity + Number(data.quantity), expirationDate: expirationDate})
    } else {
      await setDoc(docRef,{quantity: Number(quantity), expirationDate: expirationDate})
    }
    await updateInventory()
  }


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
  const handleEditClose = () => setEditOpen(false)

  const handleDelete = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    await deleteDoc(docRef)
    await updateInventory()
  }

  


  


  return (

      <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            padding = {4}
          >
            <Analytics mode={'production'} />
            <Typography variant="h2" textAlign="center" marginBottom={4} color={'white'}>
              Pantry
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="left" marginBottom={4} >
              <Button variant="contained" color="primary" onClick={handleSearch} startIcon={<SearchIcon />}/>
              <Autocomplete color='white'
                options={inventory.map(item => ({ label: item.name }))}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                      marginRight: 50,
                      width: 400,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        color: 'grey',
                        '& fieldset': {
                          borderColor: 'white',
                        },
                        '&:hover fieldset': {
                          borderColor: 'white',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'white',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'grey',
                      },
                    }}
                  />
                )}
                onChange={(_, newValue) => {
                  setSearchQuery(newValue ? newValue.label : '');
                }}
              />
              <Button variant="contained" color="primary" onClick={handleOpenAdd} startIcon={<AddIcon />} sx={{marginLeft: 50}}>
                Add Item
              </Button>
            </Box>
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
                  />
                  <TextField
                    label="Quantity"
                    variant="outlined"
                    fullWidth
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                  <TextField
                    label="Expiration Date"
                    variant="outlined"
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      addItem(itemName, quantity, expirationDate)
                      setQuantity(1)
                      setExpirationDate('') 
                      setItemName('')
                      handleClose()
                    }}
                  >
                    Add
                  </Button>
                </Stack>
              </Box>
            </Modal>

            <Modal open={editOpen} onClose={handleEditClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
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
                  />
                  <TextField
                    label="Expiration Date"
                    variant="outlined"
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    sx={{ color: 'red' , borderColor: 'red'}}
                    onClick={() => {
                      handleDelete(itemName)
                      setEditOpen(false)
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      addItem(itemName, quantity, expirationDate)
                      setQuantity(1)
                      setExpirationDate('') 
                      setItemName('')
                      handleEditClose()
                    }}
                  >
                    Done
                  </Button>
                </Stack>
              </Box>
            </Modal>

            <Box display="flex" flexWrap="wrap"  gap={2}  >
              {inventory.map(({name, quantity, expirationDate}) => (
                <Card key={name} sx={{ width: 250}} >
                  <CardHeader 
                    title={name} 
                  />
                  <CardMedia 
                    component="img"
                    height="194"
                    alt= {name} 
                  />
                  <CardContent>
                    <Typography variant="body2" >
                      <strong>Expiration Date:</strong> <br /> {expirationDate}
                    </Typography>
                    <Typography variant="body2" >
                      <strong>Quantity:</strong> {quantity}
                    </Typography>
                    </CardContent>
                    <CardActions 
                      disableSpacing
                    >
                      <IconButton onClick={handleOpenEdit(name, quantity, expirationDate)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton  onClick={() => removeItem(name, quantity, expirationDate)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                </Card>
              ))}
            </Box>
          </Box>
      </ThemeProvider>
  )
}
