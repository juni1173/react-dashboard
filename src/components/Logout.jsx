import axios from 'axios';

function Logout() {
  axios.post('https://blogpepper.com/backend/api/logout.php')
  .then((response) => {
    sessionStorage.clear();
    window.location.href = '/portal-app/login';
  })
  .catch((error) => {
     console.error(error);
  });
}

export default Logout;