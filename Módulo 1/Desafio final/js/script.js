const listContainer = document.querySelector('#user-list');
const statisticsContainer = document.querySelector('#statistics');

let users;
let filteredUsers;
let statistics;
let searchInput;

const fetchUsers = async () => {
  try {
    const response = await fetch(
      'https://randomuser.me/api/?seed=javascript&results=100&nat=BR&noinfo'
    );
    const json = await response.json();
    users = json.results.map((user) => ({
      firstName: user.name.first,
      lastName: user.name.last || '',
      gender: user.gender,
      age: user.dob.age,
      thumbnail: user.picture.thumbnail,
    }));
    filterUsers();
  } catch (error) {
    alert(`Error ${error}`);
  }
};

const filterUsers = (value) => {
  if (!users) return;
  filteredUsers = !value
    ? []
    : users
        .filter((user) =>
          `${user.firstName.toLowerCase()} ${user.lastName.toLowerCase()}`.includes(
            value.toLowerCase()
          )
        )
        .sort((a, b) =>
          (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName)
        );
  renderUsers();
  renderStatistics();
};

const renderUsers = () => {
  if (!filteredUsers.length) {
    listContainer.innerHTML =
      "<h2 class='user-counter text-center'>Nenhum usuário filtrado</h2>";
    return;
  }
  listContainer.innerHTML =
    `
    <h2 class='user-counter text-center'>${filteredUsers.length} usuário${
      filteredUsers.length > 1 ? 's' : ''
    } encontrado${filteredUsers.length > 1 ? 's' : ''}
    </h2>
    <ul class='users'>` +
    filteredUsers
      .map(
        (user) => `
        <li class='user'>
            <img src='${user.thumbnail}' alt='thumbnail' class='user-thumbnail' />
            <span class='user-info'>
                ${user.firstName} ${user.lastName}, ${user.age} anos
            </span>
        </li>`
      )
      .join('') +
    '</ul>';
};

const renderStatistics = () => {
  if (!filteredUsers.length) {
    statisticsContainer.innerHTML =
      "<h2 class='user-counter text-center'>Nada a ser exibido</h2>";
    return;
  }
  const ageSum = filteredUsers.reduce((memo, user) => memo + user.age, 0);
  const statistics = {
    male: filteredUsers.filter((user) => user.gender == 'male').length,
    female: filteredUsers.filter((user) => user.gender == 'female').length,
    ageSum,
    ageAvg: ageSum / filteredUsers.length,
  };
  statisticsContainer.innerHTML = `
        <h2 class='user-conuter text-center'>
            Estatísticas
        </h2>
        <ul class='statistics'>
            <li>Sexo Masculino : ${statistics.male.toFixed(0)}</li>
            <li>Sexo Feminino : ${statistics.female.toFixed(0)}</li>
            <li>Soma das idades : ${statistics.ageSum.toFixed(0)}</li>
            <li>Média das idades : ${statistics.ageAvg.toFixed(2)}</li>
        </ul>
    `;
};

const bindEvents = () => {
  const input = document.querySelector('#input-search');

  document.querySelector('#btn-search').addEventListener('click', () => {
    filterUsers(input.value);
  });
  input.addEventListener('keyup', (event) => {
    filterUsers(input.value);
  });
};

const init = () => {
  fetchUsers();
  bindEvents();
};

window.addEventListener('load', init);
