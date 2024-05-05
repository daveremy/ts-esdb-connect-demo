from collections import defaultdict
import string
import time
from esdbclient.exceptions import ServiceUnavailable
from esdbclient import EventStoreDBClient, NewEvent, StreamState
import json
import random
import os
print("RUNNING PYTHON SCRIPT")

# Settings for the EventStoreDB connection
ESDB_HOST = os.getenv('EVENTSTORE_HOST', 'localhost')
EVENTSTOREDB_URI = f"esdb://{ESDB_HOST}:2113?tls=false"

STREAM_PREFIX = "loanApplication-"

MAX_ACTIVE_LOANS = 15
MIN_TIME_BETWEEN_EVENTS = 1
MAX_TIME_BETWEEN_EVENTS = 3


def connect_to_eventstore(connectionString, retries=10, delay=5):
    """Attempt to connect to EventStoreDB with retries."""
    client = EventStoreDBClient(connectionString)
    while retries > 0:
        try:
            # Append a dummy event to see if EventStore is running
            event_data = json.dumps({"test": "data"}).encode('utf-8')
            new_event = NewEvent(type="TestEvent", data=event_data)
            client.append_to_stream(
                stream_name="test_stream",
                current_version=StreamState.ANY,
                events=[new_event])
            return client
        except ServiceUnavailable as e:
            print(f"Connection failed: {e}. Retrying in {delay} seconds...")
            time.sleep(delay)
            retries -= 1
    raise ConnectionError(
        "Failed to connect to EventStoreDB after several retries.")


def generate_loan_id():
    """
    Generates a unique loan identifier with 10 uppercase characters, formatted with a hyphen after the first 4 characters.
    """
    identifier = ''.join(random.choices(
        string.ascii_uppercase + string.digits, k=10))
    return f"{identifier[:4]}-{identifier[4:]}"

# Event-specific data generation functions


def application_received(loan_id):
    return {
        "applicantName": "John Doe",
        "loanAmount": random.randint(5000, 50000),
        "loanPurpose": "Home Renovation"
    }


def credit_check_initiated(loan_id):
    return {
        "creditCheckAgency": "Credit Bureau"
    }


def credit_check_completed(loan_id):
    return {
        "creditScore": random.randint(300, 850),
        "creditStatus": random.choice(["Good", "Fair", "Poor"])
    }


def decision_event(loan_id, event_type):
    return {
        "reviewer": "Loan Officer",
        "decisionReason": "Satisfactory Credit Score" if event_type == "ApplicationApproved" else "Unsatisfactory Credit Score"
    }


def manual_review_required(loan_id):
    return {
        "reviewReason": "Incomplete Application Details"
    }


def loan_disbursed(loan_id):
    return {
        "disbursementAmount": random.randint(5000, 50000),
        "disbursementDate": time.strftime('%Y-%m-%d', time.gmtime())
    }


# Mapping of event types to their corresponding data generation function
event_type_to_function = {
    "ApplicationReceived": application_received,
    "CreditCheckInitiated": credit_check_initiated,
    "CreditCheckCompleted": credit_check_completed,
    "ApplicationApproved": lambda uid: decision_event(uid, "ApplicationApproved"),
    "ApplicationDenied": lambda uid: decision_event(uid, "ApplicationDenied"),
    "ManualReviewRequired": manual_review_required,
    "LoanDisbursed": loan_disbursed
}


def create_event_data(event_type, loan_id):
    """
    Creates specific event data based on the event type, including the unique loan identifier as the loan_id.
    """
    event_data_function = event_type_to_function[event_type]
    data = {
        "loanId": loan_id,
        "timestamp": time.time(),
        **event_data_function(loan_id)
    }
    return data


def next_event_sequence(last_event):
    if last_event == "ApplicationReceived":
        return "CreditCheckInitiated"
    elif last_event == "CreditCheckInitiated":
        return "CreditCheckCompleted"
    elif last_event == "CreditCheckCompleted":
        return random.choice(["ApplicationApproved", "ApplicationDenied", "ManualReviewRequired"])
    elif last_event == "ManualReviewRequired":
        return random.choice(["ApplicationApproved", "ApplicationDenied"])
    elif last_event == "ApplicationApproved":
        return "LoanDisbursed"
    elif last_event in ["ApplicationDenied", "LoanDisbursed"]:
        # These are final states; return None to indicate no further events
        return None
    return None


def append_event_to_loan(loan_id, event_type, active_loans):
    """
    Appends an event to a loan's event sequence, both in the active_loans dictionary and in the EventStoreDB stream.
    """
    # Generate event data using the event_type_to_function mapping
    event_data = create_event_data(event_type, loan_id)

    # Append event to the EventStoreDB stream
    client.append_to_stream(
        stream_name=STREAM_PREFIX + loan_id,
        current_version=StreamState.ANY,
        events=[NewEvent(type=event_type, data=json.dumps(
            event_data).encode('utf-8'))]
    )

    # Log the event generation
    print(f"Generated '{event_type}' event for loan {loan_id}.")

    # Update the active_loans dictionary
    active_loans[loan_id].append(event_type)


def choose_loan_for_next_action(active_loans):
    return random.choice(list(active_loans.keys()))


def continuous_event_generation(client):
    active_loans = defaultdict(list)

    while True:
        # Ensure there are active loans being processed
        while len(active_loans) < MAX_ACTIVE_LOANS:
            loan_id = generate_loan_id()
            append_event_to_loan(loan_id, "ApplicationReceived", active_loans)

        loan_id = choose_loan_for_next_action(active_loans)
        if loan_id:
            events = active_loans[loan_id]
            last_event = events[-1]
            new_event = next_event_sequence(last_event)

            if new_event:
                append_event_to_loan(loan_id, new_event, active_loans)
                # Random delay after processing an event
                time.sleep(random.uniform(
                    MIN_TIME_BETWEEN_EVENTS, MAX_TIME_BETWEEN_EVENTS))

            # If the event is a final state, remove the loan from active processing
            if new_event is None:
                del active_loans[loan_id]

        # Add some delay before choosing the next loan
        time.sleep(random.uniform(
            MIN_TIME_BETWEEN_EVENTS, MAX_TIME_BETWEEN_EVENTS))


if __name__ == "__main__":
    print("Starting event generator for ESDB Connector Loan Demo App")
    client = connect_to_eventstore(EVENTSTOREDB_URI)
    continuous_event_generation(client)
