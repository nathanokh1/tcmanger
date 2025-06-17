# Software Testing Fundamentals and Methodologies

## Table of Contents
1. [Introduction to Software Testing](#introduction)
2. [Software Testing Life Cycle (STLC)](#stlc)
3. [Testing Methodologies](#methodologies)
4. [Testing Levels](#levels)
5. [Testing Types](#types)
6. [Test Planning and Strategy](#planning)
7. [Test Case Development](#test-cases)
8. [Test Environment Setup](#environment)
9. [Test Execution and Management](#execution)
10. [Defect Management](#defects)
11. [Test Metrics and Reporting](#metrics)
12. [Quality Assurance vs Quality Control](#qa-vs-qc)

## Introduction to Software Testing <a name="introduction"></a>

### What is Software Testing?
Software testing is a comprehensive process that involves evaluating a software application to identify bugs, gaps, or missing requirements in comparison to the specified requirements. It's a critical component of the software development life cycle (SDLC) that ensures the quality, reliability, and performance of software products.

### Objectives of Software Testing
1. **Bug Detection**: Identify and fix defects before software release
2. **Quality Assurance**: Ensure software meets quality standards
3. **Requirements Validation**: Verify all requirements are met
4. **User Experience**: Ensure software is user-friendly
5. **Performance Verification**: Validate performance under various conditions
6. **Security Assessment**: Identify security vulnerabilities
7. **Compliance**: Ensure adherence to industry standards and regulations

### Key Principles of Software Testing
1. **Testing Shows Presence of Defects**: Testing can show that defects are present, but cannot prove that there are no defects
2. **Exhaustive Testing is Impossible**: Testing everything (all combinations of inputs and preconditions) is not feasible except for trivial cases
3. **Early Testing**: Testing activities should start as early as possible in the software development life cycle
4. **Defect Clustering**: A small number of modules usually contain most of the defects discovered
5. **Pesticide Paradox**: If the same tests are repeated over and over, they will eventually stop finding new defects
6. **Testing is Context Dependent**: Testing is done differently in different contexts
7. **Absence-of-Errors Fallacy**: Finding and fixing defects does not help if the system built does not meet user needs and expectations

### Testing Terminology
- **Verification**: The process of checking whether the software meets the specifications
- **Validation**: The process of checking whether the software meets the user's needs
- **Error**: A human action that produces an incorrect result
- **Defect**: A flaw in the software that causes it to fail to perform its required function
- **Failure**: The inability of a system or component to perform its required function
- **Test Case**: A set of conditions or variables under which a tester will determine whether a system satisfies requirements
- **Test Suite**: A collection of test cases that are intended to be executed together
- **Test Plan**: A document describing the scope, approach, resources, and schedule of intended testing activities
- **Test Strategy**: A high-level document that outlines the testing approach, objectives, and methods
- **Test Environment**: The hardware and software environment in which tests are executed

## Software Testing Life Cycle (STLC) <a name="stlc"></a>

### Phase 1: Requirement Analysis
- Review requirements documents
- Identify testable requirements
- Identify test environment needs
- Identify testing tools needed
- Create requirement traceability matrix (RTM)

### Phase 2: Test Planning
- Define test objectives
- Define test scope
- Define test strategy
- Identify test resources
- Create test schedule
- Define test deliverables
- Define entry and exit criteria

### Phase 3: Test Case Development
- Create test cases
- Create test scripts
- Create test data
- Review test cases
- Create test case traceability matrix

### Phase 4: Test Environment Setup
- Set up test environment
- Set up test data
- Set up test tools
- Verify test environment

### Phase 5: Test Execution
- Execute test cases
- Record test results
- Report defects
- Track defects
- Re-test fixed defects

### Phase 6: Test Cycle Closure
- Test closure report
- Test metrics
- Test summary report
- Lessons learned

## Testing Methodologies <a name="methodologies"></a>

### 1. Waterfall Testing
The Waterfall model is a sequential approach where testing occurs after development is complete. It's a rigid and structured methodology suitable for projects with well-defined requirements.

#### Characteristics
- Sequential process
- Each phase must be completed before moving to the next
- Changes are difficult to implement once a phase is complete
- Testing occurs after development
- Documentation is extensive
- Customer involvement is limited

#### Advantages
- Clear structure and milestones
- Easy to understand and manage
- Well-defined deliverables
- Suitable for small projects with clear requirements

#### Disadvantages
- Limited flexibility for changes
- Late testing can lead to expensive fixes
- Customer feedback comes late in the process
- High risk of project failure if requirements change

### 2. Agile Testing
Agile testing is an iterative and incremental approach where testing occurs throughout the development cycle. It emphasizes collaboration, adaptability, and customer satisfaction.

#### Characteristics
- Iterative and incremental development
- Continuous testing throughout development
- Close collaboration between developers and testers
- Self-organizing teams
- Customer involvement throughout the process
- Adaptable to changing requirements

#### Key Practices
1. **Continuous Integration/Continuous Testing**
   - Automated tests run with each code change
   - Early detection of integration issues
   - Rapid feedback on code quality

2. **Test-Driven Development (TDD)**
   - Write tests before writing code
   - Write minimal code to pass tests
   - Refactor code while keeping tests passing
   - Ensures code meets requirements

3. **Behavior-Driven Development (BDD)**
   - Focus on behavior rather than implementation
   - Collaboration between developers, testers, and business stakeholders
   - Tests written in natural language
   - Ensures alignment with business requirements

4. **Acceptance Test-Driven Development (ATDD)**
   - Tests written from user perspective
   - Focus on user acceptance criteria
   - Collaboration between developers, testers, and users
   - Ensures software meets user needs

#### Advantages
- Early and continuous testing
- Rapid feedback and adaptation
- Customer satisfaction through continuous delivery
- Reduced risk through incremental development
- Improved team collaboration

#### Disadvantages
- Requires skilled and experienced team members
- May be challenging for large, complex projects
- Requires strong customer involvement
- May lack comprehensive documentation

### 3. V-Model Testing
The V-Model is an extension of the waterfall model that emphasizes verification and validation. Each development phase has a corresponding testing phase.

#### Characteristics
- Sequential process with verification and validation
- Each development phase has a corresponding testing phase
- Testing is planned alongside development
- Emphasis on verification and validation
- Good for projects requiring strict compliance

#### Phases and Corresponding Tests
1. **Requirements Analysis → Acceptance Testing**
2. **System Design → System Testing**
3. **Architecture Design → Integration Testing**
4. **Module Design → Unit Testing**

#### Advantages
- Early test planning
- Clear verification and validation phases
- Good for projects requiring strict compliance
- Well-defined deliverables

#### Disadvantages
- Limited flexibility for changes
- Sequential process can be slow
- Late customer feedback
- High risk if requirements change

### 4. DevOps Testing
DevOps testing integrates testing into the DevOps pipeline, focusing on continuous testing and feedback.

#### Characteristics
- Integration of testing into DevOps pipeline
- Automated testing at multiple stages
- Continuous testing and feedback
- Focus on speed and reliability
- Collaboration between development and operations

#### Key Practices
1. **Continuous Testing**
   - Automated tests run continuously
   - Early detection of issues
   - Rapid feedback

2. **Infrastructure as Code**
   - Test environments created automatically
   - Consistent test environments
   - Reduced environment setup time

3. **Automated Deployment**
   - Automated deployment to test environments
   - Consistent deployment process
   - Reduced deployment errors

4. **Monitoring and Feedback**
   - Continuous monitoring of application
   - Rapid feedback on issues
   - Proactive problem resolution

#### Advantages
- Faster delivery of software
- Improved quality through continuous testing
- Reduced risk through early detection
- Better collaboration between teams

#### Disadvantages
- Requires significant automation
- May be challenging for legacy systems
- Requires skilled team members
- Initial setup can be complex

## Testing Levels <a name="levels"></a>

### 1. Unit Testing
Unit testing involves testing individual components or modules of the software in isolation.

#### Characteristics
- Tests individual components
- Usually performed by developers
- Focuses on functionality
- Automated using testing frameworks
- Fast execution

#### Techniques
- **Statement Coverage**: Testing every statement in the code
- **Branch Coverage**: Testing every branch in the code
- **Path Coverage**: Testing every possible path through the code

#### Tools
- JUnit (Java)
- NUnit (.NET)
- PyTest (Python)
- Jest (JavaScript)

### 2. Integration Testing
Integration testing involves testing the interaction between components or modules.

#### Characteristics
- Tests component interactions
- Can be performed by developers or testers
- Focuses on interfaces
- Can be automated or manual
- Slower than unit testing

#### Approaches
- **Top-Down**: Testing from top-level components down
- **Bottom-Up**: Testing from lower-level components up
- **Big Bang**: Testing all components together
- **Sandwich**: Combining top-down and bottom-up approaches

#### Tools
- Postman
- REST Assured
- Selenium
- JMeter

### 3. System Testing
System testing involves testing the entire software system as a whole.

#### Characteristics
- Tests the entire system
- Usually performed by testers
- Focuses on functionality, performance, security, etc.
- Can be automated or manual
- Slower than integration testing

#### Types
- **Functional Testing**: Testing functionality
- **Performance Testing**: Testing performance
- **Security Testing**: Testing security
- **Usability Testing**: Testing usability
- **Compatibility Testing**: Testing compatibility

#### Tools
- Selenium
- JMeter
- LoadRunner
- Burp Suite

### 4. Acceptance Testing
Acceptance testing involves testing the software against user requirements.

#### Characteristics
- Tests against user requirements
- Usually performed by users or testers
- Focuses on user needs
- Can be automated or manual
- Slowest of all testing levels

#### Types
- **User Acceptance Testing (UAT)**: Testing by users
- **Business Acceptance Testing (BAT)**: Testing by business stakeholders
- **Contract Acceptance Testing (CAT)**: Testing against contract requirements
- **Regulation Acceptance Testing (RAT)**: Testing against regulatory requirements

#### Tools
- Cucumber
- SpecFlow
- Robot Framework
- Behave

## Testing Types <a name="types"></a>

### 1. Functional Testing
Functional testing involves testing the functionality of the software.

#### Characteristics
- Tests functionality
- Based on requirements
- Can be automated or manual
- Focuses on what the software does

#### Techniques
- **Equivalence Partitioning**: Dividing input data into partitions
- **Boundary Value Analysis**: Testing boundary values
- **Decision Table Testing**: Testing combinations of conditions
- **State Transition Testing**: Testing state transitions

#### Tools
- Selenium
- Playwright
- Cypress
- Puppeteer

### 2. Non-Functional Testing
Non-functional testing involves testing non-functional aspects of the software.

#### Characteristics
- Tests non-functional aspects
- Based on performance, security, usability, etc.
- Can be automated or manual
- Focuses on how the software performs

#### Types
1. **Performance Testing**
   - **Load Testing**: Testing under expected load
   - **Stress Testing**: Testing under extreme load
   - **Strain Testing**: Testing under sustained load
   - **Spike Testing**: Testing under sudden load
   - **Endurance Testing**: Testing over a long period

2. **Security Testing**
   - **Vulnerability Testing**: Testing for vulnerabilities
   - **Penetration Testing**: Testing for security breaches
   - **Security Scanning**: Scanning for security issues
   - **Risk Assessment**: Assessing security risks

3. **Usability Testing**
   - **User Interface Testing**: Testing the user interface
   - **Accessibility Testing**: Testing accessibility
   - **Compatibility Testing**: Testing compatibility
   - **Localization Testing**: Testing localization

4. **Compatibility Testing**
   - **Browser Compatibility**: Testing across browsers
   - **Device Compatibility**: Testing across devices
   - **OS Compatibility**: Testing across operating systems
   - **Resolution Compatibility**: Testing across screen resolutions

#### Tools
- JMeter (Performance)
- Burp Suite (Security)
- Lighthouse (Usability)
- BrowserStack (Compatibility)

### 3. White Box Testing
White box testing involves testing the internal structure of the software.

#### Characteristics
- Tests internal structure
- Usually performed by developers
- Based on code
- Focuses on how the software works

#### Techniques
- **Statement Coverage**: Testing every statement
- **Branch Coverage**: Testing every branch
- **Path Coverage**: Testing every path
- **Condition Coverage**: Testing every condition

#### Tools
- JUnit
- NUnit
- PyTest
- Jest

### 4. Black Box Testing
Black box testing involves testing the software without knowledge of its internal structure.

#### Characteristics
- Tests without knowledge of internal structure
- Usually performed by testers
- Based on requirements
- Focuses on what the software does

#### Techniques
- **Equivalence Partitioning**: Dividing input data into partitions
- **Boundary Value Analysis**: Testing boundary values
- **Decision Table Testing**: Testing combinations of conditions
- **State Transition Testing**: Testing state transitions

#### Tools
- Selenium
- Playwright
- Cypress
- Puppeteer

### 5. Grey Box Testing
Grey box testing involves testing with partial knowledge of the internal structure.

#### Characteristics
- Tests with partial knowledge of internal structure
- Performed by developers or testers
- Based on requirements and code
- Focuses on both what and how

#### Techniques
- **API Testing**: Testing APIs
- **Database Testing**: Testing databases
- **Web Services Testing**: Testing web services

#### Tools
- Postman
- REST Assured
- SoapUI
- Insomnia

## Test Planning and Strategy <a name="planning"></a>

### Test Plan
A test plan is a document that describes the scope, approach, resources, and schedule of intended testing activities.

#### Components
1. **Introduction**
   - Purpose
   - Scope
   - References
   - Definitions

2. **Test Strategy**
   - Testing approach
   - Testing tools
   - Testing environments
   - Testing types

3. **Test Environment**
   - Hardware requirements
   - Software requirements
   - Network requirements
   - Test data requirements

4. **Test Schedule**
   - Milestones
   - Deliverables
   - Dependencies
   - Resources

5. **Test Deliverables**
   - Test cases
   - Test scripts
   - Test data
   - Test reports

6. **Entry and Exit Criteria**
   - Entry criteria
   - Exit criteria
   - Suspension criteria
   - Resumption criteria

7. **Roles and Responsibilities**
   - Test manager
   - Test lead
   - Test engineers
   - Developers

8. **Risk Management**
   - Risk identification
   - Risk assessment
   - Risk mitigation
   - Contingency plans

### Test Strategy
A test strategy is a high-level document that outlines the testing approach, objectives, and methods.

#### Components
1. **Testing Objectives**
   - Quality objectives
   - Business objectives
   - Technical objectives

2. **Testing Approach**
   - Testing levels
   - Testing types
   - Testing techniques
   - Testing tools

3. **Testing Environment**
   - Environment setup
   - Environment management
   - Environment configuration

4. **Testing Schedule**
   - Timeline
   - Milestones
   - Dependencies

5. **Testing Resources**
   - Human resources
   - Technical resources
   - Financial resources

6. **Risk Management**
   - Risk identification
   - Risk assessment
   - Risk mitigation

## Test Case Development <a name="test-cases"></a>

### Test Case
A test case is a set of conditions or variables under which a tester will determine whether a system satisfies requirements.

#### Components
1. **Test Case ID**: Unique identifier for the test case
2. **Test Case Title**: Brief description of the test case
3. **Test Case Description**: Detailed description of the test case
4. **Prerequisites**: Conditions that must be met before the test case can be executed
5. **Test Steps**: Step-by-step instructions for executing the test case
6. **Test Data**: Data required for executing the test case
7. **Expected Results**: Expected outcomes of the test case
8. **Actual Results**: Actual outcomes of the test case
9. **Status**: Status of the test case (Pass/Fail/Blocked)
10. **Comments**: Additional comments or notes

### Test Case Design Techniques
1. **Equivalence Partitioning**
   - Dividing input data into partitions
   - Testing one value from each partition
   - Reduces the number of test cases

2. **Boundary Value Analysis**
   - Testing boundary values
   - Testing values just inside and just outside boundaries
   - Effective for finding off-by-one errors

3. **Decision Table Testing**
   - Testing combinations of conditions
   - Creating a table of conditions and actions
   - Effective for complex business rules

4. **State Transition Testing**
   - Testing state transitions
   - Creating a state transition diagram
   - Effective for systems with multiple states

5. **Use Case Testing**
   - Testing based on use cases
   - Creating test cases from use cases
   - Effective for user-centric systems

### Test Case Best Practices
1. **Keep Test Cases Independent**
   - Each test case should be independent
   - No dependencies between test cases
   - Easier to execute and maintain

2. **Use Meaningful Names**
   - Test case names should be descriptive
   - Include the purpose of the test case
   - Easier to understand and maintain

3. **Include Both Positive and Negative Scenarios**
   - Test both valid and invalid inputs
   - Test both expected and unexpected behaviors
   - Comprehensive testing

4. **Keep Test Cases Simple**
   - Each test case should test one thing
   - Avoid complex test cases
   - Easier to understand and maintain

5. **Include Clear Expected Results**
   - Expected results should be clear and specific
   - Include exact values where possible
   - Easier to determine pass/fail

## Test Environment Setup <a name="environment"></a>

### Test Environment
A test environment is the hardware and software environment in which tests are executed.

#### Components
1. **Hardware**
   - Servers
   - Workstations
   - Network equipment
   - Mobile devices

2. **Software**
   - Operating systems
   - Databases
   - Web servers
   - Application servers
   - Browsers
   - Testing tools

3. **Network**
   - LAN
   - WAN
   - Internet
   - Firewalls
   - Load balancers

4. **Data**
   - Test data
   - Master data
   - Reference data
   - Configuration data

### Test Environment Setup Process
1. **Identify Requirements**
   - Hardware requirements
   - Software requirements
   - Network requirements
   - Data requirements

2. **Plan Environment**
   - Environment architecture
   - Environment configuration
   - Environment management
   - Environment maintenance

3. **Set Up Environment**
   - Install hardware
   - Install software
   - Configure network
   - Prepare data

4. **Verify Environment**
   - Verify hardware
   - Verify software
   - Verify network
   - Verify data

5. **Maintain Environment**
   - Regular updates
   - Regular backups
   - Regular cleanup
   - Regular monitoring

### Test Environment Best Practices
1. **Isolate Test Environment**
   - Separate from production
   - Separate from development
   - Prevent interference

2. **Automate Environment Setup**
   - Use scripts
   - Use tools
   - Reduce manual effort
   - Ensure consistency

3. **Version Control**
   - Control software versions
   - Control data versions
   - Ensure reproducibility

4. **Documentation**
   - Document setup process
   - Document configuration
   - Document maintenance
   - Ensure knowledge transfer

## Test Execution and Management <a name="execution"></a>

### Test Execution
Test execution is the process of running test cases and recording the results.

#### Process
1. **Prepare for Execution**
   - Verify test environment
   - Verify test data
   - Verify test cases
   - Verify test scripts

2. **Execute Test Cases**
   - Run test cases
   - Record results
   - Document issues
   - Track progress

3. **Analyze Results**
   - Review results
   - Identify patterns
   - Identify trends
   - Identify issues

4. **Report Results**
   - Create test reports
   - Distribute reports
   - Review reports
   - Take action

### Test Management
Test management is the process of planning, organizing, and controlling testing activities.

#### Activities
1. **Planning**
   - Define objectives
   - Define scope
   - Define strategy
   - Define schedule

2. **Organizing**
   - Assign resources
   - Assign responsibilities
   - Assign tasks
   - Assign deadlines

3. **Controlling**
   - Monitor progress
   - Monitor quality
   - Monitor risks
   - Take corrective action

4. **Reporting**
   - Create reports
   - Distribute reports
   - Review reports
   - Take action

### Test Execution Best Practices
1. **Follow Test Plan**
   - Execute according to plan
   - Document deviations
   - Update plan as needed

2. **Record Results Accurately**
   - Record all results
   - Record all issues
   - Record all deviations
   - Ensure traceability

3. **Manage Test Data**
   - Use appropriate test data
   - Maintain test data
   - Version test data
   - Document test data

4. **Communicate Effectively**
   - Report progress regularly
   - Report issues promptly
   - Report deviations immediately
   - Ensure stakeholder awareness

## Defect Management <a name="defects"></a>

### Defect
A defect is a flaw in the software that causes it to fail to perform its required function.

#### Defect Life Cycle
1. **New**: Defect is reported
2. **Assigned**: Defect is assigned to a developer
3. **Open**: Developer starts working on the defect
4. **Fixed**: Developer fixes the defect
5. **Verified**: Tester verifies the fix
6. **Closed**: Defect is closed
7. **Reopened**: Defect is reopened if fix is not verified

#### Defect Report
1. **Defect ID**: Unique identifier for the defect
2. **Defect Title**: Brief description of the defect
3. **Defect Description**: Detailed description of the defect
4. **Steps to Reproduce**: Steps to reproduce the defect
5. **Expected Result**: Expected outcome
6. **Actual Result**: Actual outcome
7. **Severity**: Impact of the defect
8. **Priority**: Urgency of fixing the defect
9. **Status**: Current status of the defect
10. **Assigned To**: Person assigned to fix the defect
11. **Reported By**: Person who reported the defect
12. **Reported Date**: Date when the defect was reported
13. **Fixed Date**: Date when the defect was fixed
14. **Comments**: Additional comments or notes

### Defect Management Process
1. **Defect Detection**
   - Identify defects
   - Document defects
   - Report defects

2. **Defect Categorization**
   - Categorize by type
   - Categorize by severity
   - Categorize by priority
   - Categorize by module

3. **Defect Assignment**
   - Assign to developer
   - Set deadline
   - Track progress
   - Follow up

4. **Defect Resolution**
   - Fix defect
   - Verify fix
   - Close defect
   - Document resolution

5. **Defect Analysis**
   - Analyze patterns
   - Analyze trends
   - Analyze root causes
   - Take preventive action

### Defect Management Best Practices
1. **Report Defects Promptly**
   - Report as soon as found
   - Include all details
   - Attach screenshots
   - Provide steps to reproduce

2. **Use Clear and Consistent Terminology**
   - Use standard terminology
   - Be clear and concise
   - Avoid ambiguity
   - Ensure understanding

3. **Track Defects Effectively**
   - Use defect tracking tool
   - Update status regularly
   - Follow up on open defects
   - Ensure resolution

4. **Analyze Defects Regularly**
   - Analyze patterns
   - Analyze trends
   - Analyze root causes
   - Take preventive action

## Test Metrics and Reporting <a name="metrics"></a>

### Test Metrics
Test metrics are measurements used to evaluate the testing process and the quality of the software.

#### Types of Metrics
1. **Process Metrics**
   - Test case preparation time
   - Test execution time
   - Defect detection rate
   - Defect resolution time

2. **Product Metrics**
   - Defect density
   - Defect severity
   - Test coverage
   - Code coverage

3. **Project Metrics**
   - Schedule variance
   - Cost variance
   - Resource utilization
   - Risk metrics

### Test Reports
Test reports are documents that summarize the testing activities and results.

#### Types of Reports
1. **Test Summary Report**
   - Summary of testing activities
   - Summary of test results
   - Summary of defects
   - Recommendations

2. **Test Progress Report**
   - Progress against plan
   - Completed activities
   - Pending activities
   - Issues and risks

3. **Defect Report**
   - Defect statistics
   - Defect trends
   - Defect distribution
   - Defect resolution

4. **Test Coverage Report**
   - Requirements coverage
   - Code coverage
   - Test case coverage
   - Defect coverage

### Metrics and Reporting Best Practices
1. **Define Clear Metrics**
   - Define purpose
   - Define calculation
   - Define target
   - Define frequency

2. **Collect Data Accurately**
   - Collect all data
   - Collect accurate data
   - Collect timely data
   - Document collection process

3. **Analyze Data Effectively**
   - Analyze patterns
   - Analyze trends
   - Analyze root causes
   - Take action

4. **Present Data Clearly**
   - Use appropriate charts
   - Use appropriate tables
   - Use appropriate text
   - Ensure understanding

## Quality Assurance vs Quality Control <a name="qa-vs-qc"></a>

### Quality Assurance (QA)
Quality Assurance is a process-oriented approach that focuses on preventing defects.

#### Characteristics
- Process-oriented
- Preventive approach
- Proactive
- Focus on process improvement
- Involves entire team
- Continuous activity

#### Activities
- Process definition
- Process implementation
- Process monitoring
- Process improvement
- Training
- Auditing

### Quality Control (QC)
Quality Control is a product-oriented approach that focuses on identifying defects.

#### Characteristics
- Product-oriented
- Detective approach
- Reactive
- Focus on product verification
- Involves testing team
- Periodic activity

#### Activities
- Test planning
- Test case development
- Test execution
- Defect reporting
- Defect tracking
- Test reporting

### QA vs QC Comparison
| Aspect | QA | QC |
|--------|----|----|
| Focus | Process | Product |
| Approach | Preventive | Detective |
| Timing | Proactive | Reactive |
| Goal | Prevent defects | Identify defects |
| Team | Entire team | Testing team |
| Activity | Continuous | Periodic |

### Integration of QA and QC
- QA and QC are complementary
- Both are necessary for quality software
- QA provides the framework for QC
- QC provides feedback for QA
- Together they ensure quality software 