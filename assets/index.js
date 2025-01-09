const { jsPDF } = window.jspdf;

// Form for adding items to a list
const formNFS = document.getElementById("formNFS");
// taxForm for adding tax values
const taxForm = document.getElementById("taxForm");

// List of added items that will be displayed
const itemList = document.getElementById("itemList");

const resultContainer = document.getElementById("result-container");
const taxContainer = document.getElementById("tax-container");

const calcNF = document.getElementById("calcNF");

// list of {name: value} objects representing added items
const addedItems = [];
// Current tax values
const taxValues = {};

const generatePDFButton = document.createElement("button");
generatePDFButton.textContent = "Generate PDF";

// Handle form submission
formNFS.addEventListener("submit", function (event) {
	event.preventDefault();

	const formData = new FormData(formNFS);

	// Create an object to store current item
	const item = {};

	const listItem = document.createElement("li");

	// Iterate over the form fields and add each item to the list
	for (const [name, value] of formData.entries()) {
		// Make the item accessible by name
		item[name] = value;

		itemList.appendChild(listItem);
	}

	const container = document.createElement("div");
	// Iterate over the item object and create a new element for each key-value pair
	for (const [key, value] of Object.entries(item)) {
		if (key === "Item vendido") {
			const el = document.createElement("h3");
			el.textContent = `${key}: ${value}`;
			container.appendChild(el);
		} else {
			const el = document.createElement("p");
			el.textContent = `${key}: R$${value}`;
			container.appendChild(el);
		}
	}

	listItem.appendChild(container);

	addedItems.push(item);
	formNFS.reset();
});

calcNF.addEventListener("click", function () {
	let totalSales = addedItems.reduce((previous_val, item) => {
		return previous_val + parseFloat(item["Valor de venda"]);
	}, 0);

	// handles dynamically updating the total sales value
	const el = document.createElement("h2");
	el.id = "total-sales";
	if (!document.getElementById("total-sales")) {
		el.textContent = `VALOR TOTAL DA NOTA: R$${totalSales}`;
		resultContainer.appendChild(el);
	} else {
		document.getElementById(
			"total-sales"
		).textContent = `VALOR TOTAL DA NOTA: R$${totalSales}`;
	}

	const taxFormData = new FormData(taxForm);

	// Iterate over the form fields and spawns a new element for each key-value pair
	for (const [name, value] of taxFormData.entries()) {
		taxValues[name] = value;
	}

	// cleaning previous values
	if (taxContainer.childElementCount > 0) {
		taxContainer.innerHTML = "";
	}

	// Inserting the tax values into the result container
	for (const [key, value] of Object.entries(taxValues)) {
		const paragraphElement = document.createElement("p");
		const titleElement = document.createElement("h3");

		titleElement.textContent = `${key}:`;
		paragraphElement.textContent = `${value}%`;
		taxContainer.appendChild(titleElement);
		taxContainer.appendChild(paragraphElement);

		resultContainer.appendChild(taxContainer);
	}

	resultContainer.appendChild(generatePDFButton);
});

generatePDFButton.addEventListener("click", function () {
	const doc = new jsPDF();

	let totalSales = addedItems.reduce((previous_val, item) => {
		return previous_val + parseFloat(item["Valor de venda"]);
	}, 0);

	const pageSize = doc.internal.pageSize;
	const pageWidth = pageSize.getWidth();
	const pageHeight = pageSize.getHeight();
	const centerX = Math.trunc(pageWidth) / 2;

	let yOffset = 10;
	doc.setFontSize(16);

	doc.setFont(undefined, "bold");
	doc.text("Nota Fiscal", centerX, 10);
	doc.setFont(undefined, "normal");
	yOffset += 10;

	if (addedItems.length === 0) {
		doc.text("Nenhum item adicionado", centerX, yOffset);
		yOffset += 10;
	} else {
		doc.setFont(undefined, "bold");
		doc.text("Dados do prestador:", centerX, yOffset);
		doc.setFont(undefined, "normal");
		yOffset += 10;

		doc.setFont(undefined, "bold");
		doc.text("Nome:", 10, yOffset);
		doc.setFont(undefined, "normal");
		yOffset += 10;

		doc.setFont(undefined, "bold");
		doc.text("CPF/CNPJ:", 10, yOffset);
		doc.setFont(undefined, "normal");

		yOffset += 10;
		doc.line(10, yOffset, pageWidth - 10, yOffset);
		yOffset += 10;

		doc.setFont(undefined, "bold");
		doc.text("Dados do cliente:", centerX, yOffset);
		doc.setFont(undefined, "normal");
		yOffset += 10;

		doc.setFont(undefined, "bold");
		doc.text("Nome:", 10, yOffset);
		doc.setFont(undefined, "normal");
		yOffset += 10;

		doc.setFont(undefined, "bold");
		doc.text("CPF/CNPJ:", 10, yOffset);
		doc.setFont(undefined, "normal");

		yOffset += 20;
		doc.setFont(undefined, "bold");
		doc.text("Itens da Nota", 10, yOffset);
		doc.setFont(undefined, "normal");
		yOffset += 10;

		addedItems.forEach((item, index) => {
			doc.text(`Item ${index + 1}:`, 10, yOffset);
			yOffset += 10;
			for (const [key, value] of Object.entries(item)) {
				doc.text(`${key}: R$${value}`, 10, yOffset);
				yOffset += 10;
			}
			yOffset += 10;
		});

		doc.setFont(undefined, "bold");
		doc.text(`Valor total: R$${totalSales}`, 10, yOffset);
		doc.setFont(undefined, "normal");
		yOffset += 10;

		doc.setFont(undefined, "bold");
		doc.text("Impostos (%):", 10, yOffset);
		doc.setFont(undefined, "normal");
		yOffset += 10;

		for (const [key, value] of Object.entries(taxValues)) {
			doc.text(`${key}: ${value}%`, 10, yOffset);
			yOffset += 10;
		}
	}
	doc.output("dataurlnewwindow");
});
