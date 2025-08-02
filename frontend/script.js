document.getElementById("cvForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const resume = document.getElementById("resume").value;
  const jobDescription = document.getElementById("jobDesc").value;

  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "⏳ Generating...";

  try {
    const response = await fetch("http://localhost:5000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resume, jobDescription }),
    });

    const data = await response.json();

    if (data.result) {
      const parsed = JSON.parse(data.result.match(/```json\n([\s\S]*?)```/i)?.[1] || "{}");
      const bullets = parsed.bullets || [];
      const letter = parsed.coverLetter || "";

      outputDiv.innerHTML = `
        <h3>📌 Optimized Resume Bullets:</h3>
        <ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
        <h3>✉️ Cover Letter:</h3>
        <pre>${letter}</pre>
      `;
    } else {
      outputDiv.innerHTML = "⚠️ No result received.";
    }
  } catch (err) {
    console.error(err);
    outputDiv.innerHTML = "❌ Error generating output.";
  }
});
