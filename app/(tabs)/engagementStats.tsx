import PersonalStats from '../(report)/personalStats';
import { H2, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';


const EngagmentStats = () => {
    return (
        <SafeAreaViewContainer>
            <ScrollContainer>
                <H2>Personal Statistics</H2>
                <PersonalStats/>
            </ScrollContainer>
        </SafeAreaViewContainer>
    )
}

export default EngagmentStats