document.addEventListener('DOMContentLoaded', () => {
    const createJobBtn = document.getElementById('createJobBtn');
    const changeResumeBtn = document.getElementById('changeResumeBtn');
    const resumeInput = document.getElementById('resumeInput');
    const resumePreview = document.getElementById('resumePreview');
    const copyBtn = document.getElementById('copyBtn');
    const coverLetterEl = document.getElementById('coverLetter');
    const outputDiv = document.getElementById('output');
    const messageDiv = document.getElementById('message');

    // Load stored resume text on page load
    chrome.storage.local.get(['resumeText', 'resumeFileName'], function (result) {
        if (result.resumeText) {
            document.body.classList.remove('no-resume');
            const charCount = result.resumeText.length;
            resumePreview.textContent = `${result.resumeFileName} (${charCount} characters)`;
            changeResumeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>`;
        } else {
            document.body.classList.add('no-resume');
            resumePreview.textContent = "Please Attach Resume";
            changeResumeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"></path>
                </svg>
                Add Resume`;
        }
    });

    // Trigger file input when "Change Resume" is clicked.
    changeResumeBtn.addEventListener('click', () => {
        resumeInput.click();
    });

    // Process the selected PDF file
    resumeInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const fileReader = new FileReader();
        fileReader.onload = function () {
            const typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
                let maxPages = pdf.numPages;
                let countPromises = [];
                for (let j = 1; j <= maxPages; j++) {
                    let page = pdf.getPage(j);
                    countPromises.push(page.then(function (page) {
                        return page.getTextContent().then(function (textContent) {
                            return textContent.items.map(item => item.str).join(' ');
                        });
                    }));
                }
                Promise.all(countPromises).then(function (texts) {
                    const fullText = texts.join('\n');
                    const charCount = fullText.length;
                    chrome.storage.local.set({ 
                        resumeText: fullText,
                        resumeFileName: file.name 
                    }, function () {
                        document.body.classList.remove('no-resume');
                        resumePreview.textContent = `${file.name} (${charCount} characters)`;
                        changeResumeBtn.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>`;
                        messageDiv.textContent = 'Resume saved successfully!';
                    });
                });
            }).catch(function (error) {
                console.error("Error reading PDF:", error);
                messageDiv.textContent = 'Failed to read PDF.';
            });
        };
        fileReader.readAsArrayBuffer(file);
    });

    // Function to check if URL is a job posting
    function isJobPostingURL(url) {
        // Convert URL to lowercase for case-insensitive matching
        const lowercaseUrl = url.toLowerCase();

        // List of common job-related keywords
        const jobKeywords = ['job', 'jobid', 'linkedin', 'career', 'greenhouse', 'instahyre', 'position', 'apply', 'vacancy', 'opening', 'recruitment', 'hire', 'employment'];

        // Check if URL contains any job-related keyword
        return jobKeywords.some(keyword => lowercaseUrl.includes(keyword));
    }

    // Event for "Create Job Description" button.
    createJobBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let currentUrl = tabs[0].url;
            
            // Check if the current URL is a job posting
            if (!isJobPostingURL(currentUrl)) {
                alert("This doesn't appear to be a valid job posting page. Please navigate to a job posting before generating a cover letter.");
                return;
            }
            
            // Retrieve stored resume text.
            chrome.storage.local.get(['resumeText'], function (result) {
                if (!result.resumeText) {
                    alert("Please attach your resume first.");
                    return;
                }

                // Show loading state
                coverLetterEl.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;">
                            <style>
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            </style>
                            <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
                        </svg>
                        <p>Generating cover letter...</p>
                    </div>`;
                outputDiv.style.display = 'block';

                // Flatten the resume text by removing extra line breaks and whitespace
                const flattenedResumeText = result.resumeText
                    .replace(/[\r\n]+/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                const payload = {
                    currentUrl: currentUrl,
                    resumeText: flattenedResumeText
                };

                console.log('Sending payload:', payload); // Debug log

                fetch("https://webhook-redirect.onrender.com/start", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(payload)
                })
                .then(async response => {
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Response not OK:', {
                            status: response.status,
                            statusText: response.statusText,
                            errorText: errorText
                        });
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log('Received response:', data); // Debug log
                    return data;
                })
                .then(data => {
                    if (!data || !Array.isArray(data.task_output)) {
                        console.error('Invalid response format:', data);
                        throw new Error('Invalid response format');
                    }

                    const coverLetterTask = data.task_output.find(task => task.name === "Prepare The Cover Letter");
                    if (coverLetterTask && coverLetterTask.result) {
                        coverLetterEl.textContent = coverLetterTask.result;
                    } else {
                        console.error('No cover letter found in response:', data);
                        coverLetterEl.textContent = "No cover letter received.";
                    }
                })
                .catch(error => {
                    console.error("Detailed error:", error);
                    coverLetterEl.textContent = `Error: ${error.message}. Please try again.`;
                });
            });
        });
    });

    // Copy cover letter text to clipboard.
    copyBtn.addEventListener('click', () => {
        let text = coverLetterEl.textContent;
        navigator.clipboard.writeText(text)
            .then(() => {
                // Visual feedback
                copyBtn.style.backgroundColor = 'rgba(66, 133, 244, 0.2)';
                setTimeout(() => {
                    copyBtn.style.backgroundColor = '';
                }, 200);
            })
            .catch(err => {
                alert("Failed to copy cover letter: " + err);
            });
    });
});
