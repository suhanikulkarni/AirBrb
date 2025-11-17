// listingStyles.js

export const styles = {
  container: {
    padding: '20px',
  },
  loadingText: {
    fontStyle: 'italic',
    color: '#888',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  thumbnail: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  title: {
    margin: '12px 0 6px',
    fontSize: '1.1rem',
    color: '#333',
  },
  address: {
    margin: '4px 0',
    color: '#555',
  },
  price: {
    margin: '4px 0',
    fontWeight: 'bold',
    color: '#007BFF',
  },
};