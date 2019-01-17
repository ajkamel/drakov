FORMAT: 1A
SERVICE: basepath1
# Return all the things
Lists all the things from the API

## Things [/things]

### Retrieve all the things [GET]

+ Response 200 (application/json;charset=UTF-8)

    + Body

            [ 
                {
                    "text":"Zip2",
                    "id": "1"
                },
                {
                    "text":"X.com",
                    "id": "2"
                },
                {
                    "text":"SpaceX",
                    "id": "3"
                },
                {
                    "text":"Solar City",
                    "id": "4"
                },
                {
                    "text":"Hyperloop",
                    "id": "5"
                }
            ]

### Create a new thing [POST]

+ Request (application/json)

    + Body

            {
                "text": "Hyperspeed jet"
            }

+ Response 200 (application/json;charset=UTF-8)

    + Body

            {
                "text": "Hyperspeed jet",
                "id": "1"
            }