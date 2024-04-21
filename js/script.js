const apiUrl = "https://fapi.binance.com/fapi/v1/ticker/24hr";
const itemsPerPage = 10; // Number of items per page
let currentPage = 1; // Current page

function fetchAndUpdateData() {
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Sort data by symbol
      data.sort((a, b) => a.symbol.localeCompare(b.symbol));

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = data.slice(startIndex, endIndex);

      let listCoins = "";
      paginatedData.forEach((item, index) => {
        listCoins += `<tr>
                        <th scope="row">${startIndex + index + 1}</th>
                        <td>${item?.symbol}</td>
                        <td>${item?.lastPrice}</td>
                        <td>${item?.quoteVolume}</td>
                        <td>${item?.volume}</td>
                      </tr>`;
      });
      document.getElementById("listCoins").innerHTML = listCoins;

      // Update pagination links
      updatePagination(data.length);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxPagesToShow = 4; // Maximum number of pages to show
  const halfMaxPages = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, currentPage - halfMaxPages);
  let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  // Adjust startPage and endPage if needed
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  let paginationHTML = `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="previous">Previous</a>
    </li>
  `;

  // Add ellipsis for the left side if needed
  if (startPage > 1) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="#" data-page="1">1</a>
      </li>
      <li class="page-item disabled">
        <span class="page-link">...</span>
      </li>
    `;
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <li class="page-item ${currentPage === i ? "active" : ""}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  // Add ellipsis for the right side if needed
  if (endPage < totalPages) {
    paginationHTML += `
      <li class="page-item disabled">
        <span class="page-link">...</span>
      </li>
      <li class="page-item">
        <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
      </li>
    `;
  }

  paginationHTML += `
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="next">Next</a>
    </li>
  `;

  document.getElementById("paginationList").innerHTML = paginationHTML;

  // Pagination event listener
  document.querySelectorAll(".page-link").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      const page = item.getAttribute("data-page");
      if (page === "previous" && currentPage > 1) {
        currentPage--;
      } else if (page === "next" && currentPage < totalPages) {
        currentPage++;
      } else if (!isNaN(page)) {
        currentPage = parseInt(page);
      }
      fetchAndUpdateData();
    });
  });
}

fetchAndUpdateData();
// setInterval(fetchAndUpdateData, 1000);

// Get List messages
fetch("http://localhost:3000/messages")
  .then((response) => response.json())
  .then((messages) => {
    console.log(messages);

    let listMessages = "";

    messages.forEach((item) => {
      listMessages += `<div class="each-message">
    <div class="row">
      <div class="col-1"><i class="bi bi-person-circle"></i></div>
      <div
        class="col-11 d-flex justify-content-start"
        style="font-size: 15px"
      >
        ${item?.user}
      </div>
    </div>
    <div class="row">
      <div class="col-1"></div>
      <div
        class="col-11 d-flex justify-content-start message-content"
        
      >
        ${item?.message}
      </div>
    </div>
  </div>`;
    });

    document.getElementById("listMessages").innerHTML = listMessages;
  })
  .catch((error) => console.error("Error fetching messages:", error));

// Send Message
async function sendMessage() {
  try {
    const messageContent = document.getElementById("message-content").value;
    if (!messageContent.trim()) {
      alert("Please enter a message");
      return;
    }

    const user = "Anonymous";

    const response = await fetch("http://localhost:3000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageContent,
        user: user,
      }),
    });
    console.log(messageContent, user);
    if (!response.ok) {
      throw new Error("Failed to add message");
    }

    document.getElementById("message-content").value = "";
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}
