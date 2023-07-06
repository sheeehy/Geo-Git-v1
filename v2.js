function setLoading(isLoading) {
  const locationInput = document.getElementById('location');

  if (isLoading) {
    locationInput.classList.add('loading');
  } else {
    locationInput.classList.remove('loading');
  }
}

async function getUsersByLocation(location) {
  const url = `https://api.github.com/search/users?q=location:${location}&per_page=10`;
  const headers = {
    'Authorization': 'Bearer ' + 'XXX'
  };

  let response = await fetch(url, { headers });
  let data = await response.json();
  return data.items;
}

async function getUserDetails(username) {
  const url = `https://api.github.com/users/${username}`;
  const headers = {
    'Authorization': 'Bearer ' + 'XXX'
  };

  let response = await fetch(url, { headers });
  let userDetails = await response.json();

  // Fetch the number of repos
  userDetails.repos = userDetails.public_repos;
  return userDetails;
}

async function getTopUsers() {
  setLoading(true);
  let location = document.getElementById('location').value;

  history.pushState({ location: location }, "", "?location=" + location);

  let users = await getUsersByLocation(location);

  for (let user of users) {
    let details = await getUserDetails(user.login);
    user.followers = details.followers;
    user.name = details.name;
    user.repos = details.repos; // Fetch the number of repos
  }

  users.sort((a, b) => b.followers - a.followers);
  users = users.slice(0, 10);
  let output = '<table><tr><th>Rank</th><th>Name</th><th>Followers</th><th>Repositories</th><th></th></tr>';
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    output +=
      `<tr>
          <td>${i + 1}</td>
          <td><a href="${user.html_url}">${user.name || user.login}</a></td>
          <td>${user.followers.toLocaleString()}</td>
          <td>${user.repos.toLocaleString()}</td>
          <td>
            <a href="${user.html_url}">
              <img src="${user.avatar_url}" alt="${user.name || user.login}'s profile picture">
            </a>
          </td>
        </tr>`;
  }
  output += '</table>';
  document.getElementById('user-list').innerHTML = output;
  setLoading(false);
}

window.addEventListener('popstate', function (event) {
  let params = new URLSearchParams(window.location.search);
  let location = params.get('location');

  if (location) {
    document.getElementById('location').value = location;
    getTopUsers();
  }
});

window.onload = function () {
  let params = new URLSearchParams(window.location.search);
  let location = params.get('location');

  if (location) {
    document.getElementById('location').value = location;
    getTopUsers();
  }
}

document.getElementById('getUsers').addEventListener('click', getTopUsers);
