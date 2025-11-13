export const getStarValue = (starString: string) => {
	if(starString == '(NOVO)')
		return 4.3
	return parseFloat(starString)
}