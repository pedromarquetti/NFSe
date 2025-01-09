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

// Handle items form submission
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

// Handles sum of all values and taxes
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

	// Iterate over the form fields and saves the key-value pair into the taxValues object
	for (const [name, value] of taxFormData.entries()) {
		taxValues[name] = {
			value: value,
			calculated: (totalSales * value) / 100,
		};
	}

	// cleaning previous values
	if (taxContainer.childElementCount > 0) {
		taxContainer.innerHTML = "";
	}

	// Inserting the tax values into the result container
	for (const [key, value] of Object.entries(taxValues)) {
		const titleElement = document.createElement("h3");
		const taxParagraph = document.createElement("p");

		const calculatedTitle = document.createElement("h4");
		const calculatedTaxElement = document.createElement("p");

		titleElement.textContent = `${key}:`;
		taxContainer.appendChild(titleElement);

		taxParagraph.textContent = `${value["value"]}%`;
		taxContainer.appendChild(taxParagraph);

		calculatedTitle.textContent = `Imposto calculado sob ${key}: `;
		taxContainer.appendChild(calculatedTitle);

		calculatedTaxElement.textContent = `R$${value["calculated"]}`;
		taxContainer.appendChild(calculatedTaxElement);

		resultContainer.appendChild(taxContainer);
	}

	resultContainer.appendChild(generatePDFButton);
});

// Handles the generation of the PDF
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

	yOffset = addText(doc, "Nota Fiscal", pageHeight, yOffset, centerX, true);

	if (addedItems.length === 0) {
		doc.text("Nenhum item adicionado", centerX, yOffset);
		yOffset += 10;
	} else {
		yOffset = addText(
			doc,
			"Dados do prestador:",
			pageHeight,
			yOffset,
			centerX,
			true
		);

		yOffset = addText(doc, "Nome:", pageHeight, yOffset, 10, true);

		yOffset = addText(doc, "CPF/CNPJ:", pageHeight, yOffset, 10, true);

		doc.line(10, yOffset, pageWidth - 10, yOffset);

		yOffset = addText(
			doc,
			"Dados do cliente:",
			pageHeight,
			yOffset,
			centerX,
			true
		);

		yOffset = addText(doc, "Nome:", pageHeight, yOffset, 10, true);

		yOffset = addText(doc, "CPF/CNPJ:", pageHeight, yOffset, 10, true);

		yOffset += 10;

		yOffset = addText(doc, "Itens da Nota:", pageHeight, yOffset, 10, true);

		addedItems.forEach((item, index) => {
			yOffset = addText(
				doc,
				`Item ${index + 1}:`,
				pageHeight,
				yOffset,
				10,
				true
			);

			for (const [key, value] of Object.entries(item)) {
				yOffset = addText(doc, `${key}: R$${value}`, pageHeight, yOffset, 10);
			}
		});

		yOffset = addText(
			doc,
			`Valor total: R$${totalSales}`,
			pageHeight,
			yOffset,
			10,
			true
		);

		yOffset = addText(doc, "Impostos (%):", pageHeight, yOffset, 10, true);

		for (const [key, value] of Object.entries(taxValues)) {
			yOffset = addText(doc, `${key}:`, pageHeight, yOffset, 10, true);

			yOffset = addText(doc, `${value["value"]}%`, pageHeight, yOffset, 10);

			yOffset = addText(
				doc,
				`Imposto calculado: R$${value["calculated"]}`,
				pageHeight,
				yOffset,
				10
			);
			yOffset += 10;
		}
	}
	doc.output("dataurlnewwindow");
});

/// Helper function to add text to the PDF
/// If the text is too long, it will add a new page
function addText(doc, text, pageHeight, yOffset, xOffset, bold = false) {
	if (yOffset > pageHeight - 10) {
		doc.addPage();
		yOffset = 10;
	}
	doc.setFont(undefined, bold ? "bold" : "normal");
	doc.text(`${text}`, xOffset, yOffset);
	doc.setFont(undefined, "normal");

	yOffset += 10;
	return yOffset;
}
