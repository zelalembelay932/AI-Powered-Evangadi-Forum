const checkFit = async () => {
    setError("");
    if (answerText.trim().length < 20) {
    setError("Answer text must be at least 20 characters.");
    return;
    }
    setIsChecking(true);
    try {
    const response = await questionService.assessAnswerFit(questionHash, answerText);
    setFitResult(response.data);
    } catch (err) {
    setError(err.response?.data?.msg || err.response?.data?.message || "Unable to assess answer fit.");
    } finally {
    setIsChecking(false);
    }
};

<button type="button" className={styles.secondaryButton} onClick={checkFit} disabled={isChecking || isSubmitting}>
            {isChecking ? "Checking..." : "Check answer fit"}
            </button>

{fitResult && (
            <div className={`${styles.fitResult} ${styles[`fitResult--${fitResult.level}`] || ""}`}>
            <strong>Answer fit: {fitResult.level}</strong>
            <p>{fitResult.note}</p>
            </div>
        )}