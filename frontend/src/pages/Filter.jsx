import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import DatePicker from 'react-multi-date-picker';

function Filter({ filter, setFilter, filterListing, resetList }) {
  const handleFilter = (e) => {
    const {name, value} = e.target;

    setFilter((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') filterListing();
  };

  const clearFilter = () => {
    setFilter({
      'searchFilter': '',
      'minBedroomFilter': '',
      'maxBedroomFilter': '',
      'minPriceFilter': '',
      'maxPriceFilter': '',
      'reviewFilter': '',
      'dateFilter': ''
    });
    
    resetList();
  };

  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: '#f3f3f3ff',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <b>Search Filter</b>
      <FormControl sx={{ marginBottom: '10px' }}>
        <TextField
          id='filter-search-input'
          name='searchFilter'
          type='search'
          placeholder='Search Listing'
          value={filter.searchFilter}
          onChange={handleFilter}
          onKeyDown={handleKeyDown}
          variant='outlined'
          size='small'
        />
      </FormControl>

      <b>Bedroom Filter</b>
      <FormControl
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: '10px'
        }}
      >
        <FormControl
          sx={{
            marginRight: '5px',
            width: '100%'
          }}
        >
          <TextField
            id='min-bedroom-filter-input'
            name='minBedroomFilter'
            type='number'
            label='Minimum Bedroom'
            value={filter.minBedroomFilter}
            onChange={handleFilter}
            onKeyDown={handleKeyDown}
            slotProps={{ input: { min: 0 } }}
            size='small'
            onWheel={(e) => e.target.blur()}
          />
        </FormControl>
        
        <FormControl
          sx={{
            width: '100%'
          }}
        >
          <TextField
            id='max-bedroom-filter-input'
            name='maxBedroomFilter'
            type='number'
            label='Maximum Bedroom'
            value={filter.maxBedroomFilter}
            onChange={handleFilter}
            onKeyDown={handleKeyDown}
            slotProps={{ input: { min: 0 } }}
            size='small'
            onWheel={(e) => e.target.blur()}
          />
        </FormControl>
      </FormControl>

      <b>Price Filter</b>
      <FormControl
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: '10px'
        }}
      >
        <FormControl
          sx={{
            marginRight: '5px',
            width: '100%'
          }}
        >
          <TextField
            id='min-price-filter-input'
            name='minPriceFilter'
            type='number'
            label='Minimum Price'
            value={filter.minPriceFilter}
            onChange={handleFilter}
            onKeyDown={handleKeyDown}
            slotProps={{ input: { min: 0 } }}
            size='small'
            onWheel={(e) => e.target.blur()}
          />
        </FormControl>
        
        <FormControl
          sx={{
            width: '100%'
          }}
        >
          <TextField
            id='max-price-filter-input'
            name='maxPriceFilter'
            type='number'
            label='Maximum Price'
            value={filter.maxPriceFilter}
            onChange={handleFilter}
            onKeyDown={handleKeyDown}
            slotProps={{ input: { min: 0 } }}
            size='small'
            onWheel={(e) => e.target.blur()}
          />
        </FormControl>
      </FormControl>

      <b>Review Filter</b>
      <FormControl
        fullWidth
        size='small'
        sx={{
          marginBottom: '10px'
        }}
      >
        <InputLabel id='review-filter-select-label'>Review</InputLabel>
        <Select
          labelId='review-filter-select-label'
          id='review-filter-select'
          name='reviewFilter'
          value={filter.reviewFilter}
          onChange={handleFilter}
        >
          <MenuItem value={'5'}>5</MenuItem>
          <MenuItem value={'4'}>4+</MenuItem>
          <MenuItem value={'3'}>3+</MenuItem>
          <MenuItem value={'2'}>2+</MenuItem>
          <MenuItem value={'1'}>1+</MenuItem>
          <MenuItem value={'0'}>0+</MenuItem>
        </Select>
      </FormControl>

      <b>Date Filter</b>
      <DatePicker 
        range 
        value={filter.dateFilter} 
        onChange={(e, dateRange) => {
          setFilter((prevData) => ({
            ...prevData,
            'dateFilter': dateRange.validatedValue
          }));
        }}
        render={
          <TextField
            fullWidth
            size='small'
            placeholder='Filter available dates'
          />
        }
      />
      <br />

      <Button
        variant='outlined'
        onClick={clearFilter}
      >Clear Filter</Button>
      <br />

      <Button
        variant='contained'
        onClick={filterListing}
      >Search</Button>
    </Box>
  )
}

export default Filter;
