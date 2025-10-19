"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL =
    "https://assignments.isaaclauzon.com/comp4537/labs/5/sql/";

  // Get elements ONCE and store them
  const postButton = document.getElementById("static-post-btn");
  const queryForm = document.getElementById("query-form");
  const queryInput = document.getElementById("query-input");
  const queryResult = document.getElementById("query-result");

  // --- Listener for Static Post Button (Part A) ---
  postButton.addEventListener("click", function () {
    // 1. Define the static data
    const staticData = [
      { name: "Sara Brown", dob: "1901-01-01" },
      { name: "John Smith", dob: "1941-01-01" },
      { name: "Jack Ma", dob: "1961-01-30" },
      { name: "Elon Musk", dob: "1999-01-01" },
    ];

    // 2. Build the SQL query string from the data
    const values = staticData
      .map((patient) => `('${patient.name}', '${patient.dob}')`)
      .join(", ");

    const query = `INSERT INTO patient (name, date_of_birth) VALUES ${values};`;

    // 3. Send the query to the server, matching the API contract
    queryResult.textContent = "Sending query...";

    fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // 4. Display the server's response
        queryResult.textContent = JSON.stringify(data, null, 2);
      })
      .catch((error) => {
        console.error("Error:", error);
        queryResult.textContent = `Error: ${error.message}`;
      });
  });

  // --- Listener for Custom Query Form (Part B) ---
  queryForm.addEventListener("submit", function (event) {
    // Prevent form from reloading page
    event.preventDefault();

    const query = queryInput.value.trim();

    if (!query) {
      queryResult.textContent = "Please enter a SQL query.";
      return;
    }

    let method = "";
    let url = API_BASE_URL;
    const fetchOptions = {};

    // 1. Determine the correct method (GET or POST)
    if (query.toUpperCase().startsWith("SELECT")) {
      method = "GET";

      // For GET, the query goes in the URL, properly encoded
      url = `${API_BASE_URL}${encodeURIComponent(query)}`;
    } else if (query.toUpperCase().startsWith("INSERT")) {
      method = "POST";
      fetchOptions.headers = {
        "Content-Type": "application/json",
      };

      // For POST, the query goes in the body
      fetchOptions.body = JSON.stringify({ query: query });
    } else {
      queryResult.textContent =
        "Error: Only SELECT and INSERT queries are supported.";
      return;
    }

    fetchOptions.method = method;
    queryResult.textContent = "Sending query...";

    // 2. Send the fetch request
    fetch(url, fetchOptions)
      .then((response) => response.json())
      .then((data) => {
        // 3. Display the server's response
        queryResult.textContent = JSON.stringify(data, null, 2);
      })
      .catch((error) => {
        console.error("Error:", error);
        queryResult.textContent = `Error: ${error.message}`;
      });
  });
});
