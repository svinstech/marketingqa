import { companyUrlObject } from "../interfaces/link_checker_interfaces"


/*
    [ARGS]
    _baseUrl    =   The domain to use to retrieve the URLs.

    Returns an array of companyUrlObject if nothing goes wrong with the fetch() request.
    Each companyUrlObject that is returned will have the _baseUrl as the domain.
*/
export async function GetUpdatedUrlList(_baseUrl :string|null = "https://www.vouch.us/") :Promise<companyUrlObject[]> {
    let urlList :string[] = [];
    let companyUrlList :companyUrlObject[] = []; // This is what gets returned.

    if (_baseUrl) {
        const xmlUrl :string = `${_baseUrl}/sitemap.xml`;
        const outerRegex :RegExp = /<\/?url>/;
        // const urlRegex :RegExp = /^\s*<loc>(.+)<\/loc>\s*/;
        const urlRegex: RegExp = /href="(.+)"/
        const whitespaceRegex :RegExp = /^\s*$/;

        // Get the text from the xmlUrl.
        const fetchResponse :Response = await fetch(xmlUrl);
        let fetchResponseText :string = await fetchResponse.text();

        // Remove newline & carriage return characters
        fetchResponseText = fetchResponseText.replace(/\r?\n|\r/g, "");

        // Isolate each URL
        urlList = fetchResponseText.split(outerRegex);

        // Convert the urlList to just a list of the urls. (Removes all other text.)
        const urlListStartingLength :number = urlList.length;
        for (let i :number = urlListStartingLength - 1; i >= 0; i--) {
            const ithItem :string = urlList[i];

            // Remove undefined/emptyString items.
            if (!ithItem) {
                urlList.splice(i,1);
                continue;
            }
            
            if (whitespaceRegex.test(ithItem)) {
                // Remove whitespace elements.
                urlList.splice(i,1);
            } else {
                // Change ithItem to just the URL.
                const regexMatchArray :RegExpMatchArray|null = ithItem.match(urlRegex);

                // Delete items that produce no matches to the urlRegex.
                if (regexMatchArray === null) {
                    //testing
                    cy.task("log",`${i}thItem: ${ithItem}`);

                    urlList.splice(i,1);
                    continue;
                }

                //testing
                if (i === 51) {
                    cy.task("log",`!! -- ${ithItem}`)
                }

                // Overwrite the ith item with its URL.
                const url :string = regexMatchArray[1];
                urlList[i] = url;

                // Populate companyUrlList with companyUrl objects.
                const urlSegmentSplit :string[] = url.split("/");
                const companyName :string = urlSegmentSplit[urlSegmentSplit.length - 1];
                const companyUrlDetails :companyUrlObject = {url, companyName};
                companyUrlList.unshift(companyUrlDetails);
                /*
                    Here we use unshift() instead of push() because we want the 
                    ith item of companyUrl to correspond to the ith item of urlLsit,
                    and this for-loop is iterating through urlList is reverse order.

                    Changing this wont break anything but it may help future people and it doesnt hurt :).
                */
            }
        }

       

    }

    return companyUrlList;
}


