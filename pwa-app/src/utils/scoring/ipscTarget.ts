// Define the scoring order
const scoreOrder: { [key: string]: number } = {
  "A,A": 6,
  "A,C": 5,
  "A,D": 4,
  "C,C": 3,
  "C,D": 2,
  "D,D": 1,
  "D": 0.25,  // Single hit with "D"
  "C": 0.5,  // Single hit with "C"
  "A": 0.75, // Single hit with "A"
};

// Normalize the score to ensure consistency (e.g., "D,A" -> "A,D")
function normalizeScore(score: string): string {
  const hits = score.split(",");
  hits.sort(); // Sort alphabetically to ensure consistency (e.g., "D,A" -> "A,D")
  return hits.join(",");
}

// Function to keep the top two scores
function getTopTwoScores(scores: string[]): string[] {
  // Normalize all scores for consistency
  const normalizedScores = scores.map(normalizeScore);

  // Sort scores based on their rank in the scoreOrder
  normalizedScores.sort((a, b) => (scoreOrder[b] || 0) - (scoreOrder[a] || 0));

  // Keep only the top two scores
  return normalizedScores.slice(0, 2);
}


// Example usage
const hits = ["C,D", "A,A", "D", "A,D", "C,C", "D,A", "A", "D,D"];
const topScores = getTopTwoScores(hits);

console.log(topScores); // Output: ["A,A", "A,D"]
