const socketUrl = "wss://stream.binance.com:9443/ws/!ticker@arr";
const itemsPerPage = 10; // Number of items per page
let currentPage = 1; // Current page
let websocket;

function connectWebSocket() {
  websocket = new WebSocket(socketUrl);

  websocket.onopen = function () {
    console.log("WebSocket connection established.");
  };

  websocket.onerror = function (error) {
    console.error("WebSocket error:", error);
  };

  websocket.onmessage = function (event) {
    const data = JSON.parse(event.data);

    // Sort data by symbol
    data.sort((a, b) => {
      // Check if a.symbol and b.symbol are defined before comparing
      if (a.symbol && b.symbol) {
        return a.symbol.localeCompare(b.symbol);
      }
      // If either a.symbol or b.symbol is undefined, return 0 (no sorting)
      return 0;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    let listCoins = "";
    paginatedData.forEach((item, index) => {
      listCoins += `<tr>
                      <th scope="row">${startIndex + index + 1}</th>
                      <td>${item.symbol}</td>
                      <td>${item.lastPrice}</td>
                      <td>${item.quoteVolume}</td>
                      <td>${item.volume}</td>
                    </tr>`;
    });
    document.getElementById("listCoins").innerHTML = listCoins;

    // Update pagination links
    updatePagination(data.length);
  };
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
      // No need to fetch data here, it will be updated via WebSocket
    });
  });
}

connectWebSocket();

// fetchAndUpdateData();
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
        ${item?.name}
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
