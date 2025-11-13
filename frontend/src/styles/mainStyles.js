import styled from 'styled-components';

export const Page = styled.div(() => ({
  display: 'flex',
  flexDirection: 'column',
  margin: '-8px',
  padding: '0',
  backgroundColor: '#ffffffff',
  color: '#303030ff',
  fontFamily: 'Calibri'
}));

export const NavBar = styled.header(() => ({
  display: 'flex',
  flexDirection: 'row',
  margin: '0',
  padding: '15px',
  backgroundColor: '#f3f3f3ff',
  color: '#303030ff',
  fontFamily: 'Calibri',
  boxShadow: '0 0 8px #bbbbbbff'
}));

export const PageBody = styled.section(() => ({
  display: 'flex',
  flexDirection: 'column',
  margin: '0',
  padding: '15px',
}));

export const NavLeft = styled.div(() => ({
  marginRight: 'auto',
  order: '1',
}));

export const NavRight = styled.div(() => ({
  marginLeft: 'auto',
  order: '2',
}));

// export const BigButton = styled(Button)(() => ({
//   fontSize: '2em',
// }));