document.getElementById("quizForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const answers = [
    document.querySelector('input[name="q1"]:checked')?.value,
    document.querySelector('input[name="q2"]:checked')?.value,
    document.querySelector('input[name="q3"]:checked')?.value
  ];

  const res = await fetch("/api/quiz/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers })
  });

  const data = await res.json();

  window.location.href = `/result.html?score=${data.score}`;
});
