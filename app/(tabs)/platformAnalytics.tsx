import GenerateReport from '../(report)/generateReport';
import { H2, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';


const PlatformAnalytics = () => {
    return (
        <SafeAreaViewContainer>
            <ScrollContainer>
                <H2>Platform Statistics</H2>
                <GenerateReport />
            </ScrollContainer>
        </SafeAreaViewContainer>
    )
}

export default PlatformAnalytics