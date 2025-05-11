import datetime
import requests


def modal_cost_tracer(func: str, start: datetime.datetime, end: datetime.datetime, bucket: int = 60) -> dict:
    url = f"https://modal.com/api/workspaces/harshsoni082/usage-by-function?name={func}&timestampStart={start.timestamp()}&timestampEnd={end.timestamp()}&bucket={bucket}"

    payload = {}
    headers = {
      'accept': 'application/json',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'cookie': 'INGRESSCOOKIE=1714221808.688.805.577086|4aa60ed9e6a891c9abc81143be5b7a42; _ga=GA1.1.1999422876.1714221814; ajs_anonymous_id=297efeaf-e96c-4955-b331-5235f0f36e06; modal-session=se-xRNNLqvKTyOA0aSNkydM82:xx-qgidw76vQsOqcs65SLiUCc; modal-default-workspace=harshsoni082; modal-last-used-workspace=harshsoni082; _ga_GRVB0ZLLD8=GS1.1.1714809624.42.1.1714814946.0.0.0; INGRESSCOOKIE=1714814857.867.351.862912|4aa60ed9e6a891c9abc81143be5b7a42',
      'priority': 'i',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }

    response = requests.request("GET", url, headers=headers, data=payload)
    response = response.json()
    metrics = response.get('metrics')
    costs = {
        'total': 0.0
    }
    for metric in metrics:
        costs[metric.get('resource')] = costs.get(metric.get('resource'), 0.0) + metric.get('cost')
        costs['total'] += metric.get('cost')

    return costs
