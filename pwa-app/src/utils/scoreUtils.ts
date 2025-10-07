export const calculateTotals = (scores: ('A' | 'C' | 'D')[]) => {
  const scoreValues = scores.map((zone) => {
    switch (zone) {
      case 'A': return { major: 5, minor: 5 };
      case 'C': return { major: 4, minor: 3 };
      case 'D': return { major: 2, minor: 1 };
      default: return { major: 0, minor: 0 };
    }
  });

  const sortedScores = scoreValues.sort((scoreA, scoreB) => scoreB.major - scoreA.major);
  const topTwoScores = sortedScores.slice(0, 2);

  const totalMajor = topTwoScores.reduce((sum, score) => sum + score.major, 0);
  const totalMinor = topTwoScores.reduce((sum, score) => sum + score.minor, 0);

  return [totalMajor, totalMinor];
};

export const calculateHitfactor = ({ major, minor, time }: { major: number, minor: number, time: number }) => {
  return {
    major: Math.round((major / time) * 100) / 100,
    minor: Math.round((minor / time) * 100) / 100,
  };
};
