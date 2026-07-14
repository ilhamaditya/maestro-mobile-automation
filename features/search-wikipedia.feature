Feature: Search Wikipedia
  As a Wikipedia reader
  I want to search for a topic
  So that I can find relevant articles quickly

  This is a documentation-of-record artifact for business stakeholders. It is
  not executed directly - the @flow tag on each scenario names its
  corresponding Maestro flow file under .maestro/flows/features/search/, and
  tools/src/lint/check-feature-flow-mapping.ts fails CI if either side drifts
  out of sync with the other.

  @flow:search-wikipedia-returns-relevant-results
  Scenario: Searching returns relevant results
    Given I have opened the app for the first time
    When I open Search and type a topic I'm interested in
    Then I see results relevant to what I typed

  @flow:clearing-a-search-query-resets-empty-state
  Scenario: Clearing a query resets the screen
    Given I have typed a search query
    When I clear the query
    Then Search returns to its empty, ready-to-search state
