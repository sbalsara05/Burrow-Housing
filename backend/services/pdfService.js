const puppeteer = require("puppeteer");

exports.generateContractPdf = async (
	htmlContent,
	tenantSignatureUrl,
	listerSignatureUrl
) => {
	try {
		const launchOptions = {
			headless: "new",
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-gpu",
			],
		};
		if (process.env.PUPPETEER_EXECUTABLE_PATH) {
			launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
		}
		const browser = await puppeteer.launch(launchOptions);
		const page = await browser.newPage();

		// Construct the Final HTML
		// We wrap the user's content in a legal container with the signatures appended
		const fullContent = `
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 40px; line-height: 1.6; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .content { min-height: 400px; margin-bottom: 50px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
                    .sig-block { width: 45%; border-top: 1px solid #ccc; padding-top: 10px; }
                    .footer { margin-top: 50px; font-size: 10px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Sublease Agreement</h1>
                        <p>Facilitated by Burrow Housing</p>
                    </div>

                    <div class="content">
                        ${htmlContent}
                    </div>

                    <div class="signatures">
                        <div class="sig-block">
                            <p><strong>Tenant Signature</strong></p>
                            <img src="${tenantSignatureUrl}" width="200" style="display:block; margin-bottom:10px;" />
                            <p>Date: ${new Date().toLocaleDateString()}</p>
                        </div>
                        <div class="sig-block">
                            <p><strong>Landlord Signature</strong></p>
                            <img src="${listerSignatureUrl}" width="200" style="display:block; margin-bottom:10px;" />
                            <p>Date: ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div class="footer">
                        <p><strong>Liability Waiver:</strong> By signing this agreement, all parties acknowledge that Burrow Housing is strictly a listing platform and bears no liability for property damage, payment disputes, or lease violations.</p>
                        <p>Generated on ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

		await page.setContent(fullContent);

		// Generate PDF Buffer
		const pdfBuffer = await page.pdf({
			format: "A4",
			printBackground: true,
			margin: {
				top: "20px",
				bottom: "40px",
				left: "20px",
				right: "20px",
			},
		});

		await browser.close();
		return pdfBuffer;
	} catch (error) {
		console.error("PDF Generation Failed:", error);
		throw new Error("Failed to generate PDF document");
	}
};
