export const getStarValue = (starString: string) => {
	if(starString == '(NOVO)')
		return 4
	return parseFloat(starString)
}