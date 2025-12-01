#Show exists within the database, and can be retrieved with ShowName 

#NEXT
#Need to get number of seasons, and add each season with for loop (for each object in response, add row)?
#Call API call to get number of episodes in each season 
#Fill out episodes for last of us both season, so we have a fully fleshed out example show



#Take input from search bar 
#Search real time the string in search bar, to the name of show, displaying options
#Once search clicked (introduce a search button), try to find show
#Return show picture if found, alongside drop down boxes for season and episode 
#If not found, call API methods to find and populate, and then recall database methods to retrieve. 
#Final form input, triggers messaging response + dyamic search bar + creates backend query string 
#
#
#
#


#Test out trying to get the last of us tv show, seasons and episodes in to the table as a base 

#Method will most likely reside in the searchBar file, but it should use the database API call to check real time 
#results and display, if no options available, display "Nothing Found, Search For "INPUTTED VALUE""
#and if search is hit on search bar, it hits the function residing here to go through the full workflow
#May need to introduce a search bar in the UI
#Also first step is to on click of search button, generate query, and send to this method where it just prints
#to show the link 

#add unit tests with pytest? to add coverage to all API calls and code so far.