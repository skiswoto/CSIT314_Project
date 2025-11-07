import UserLogs from '../(report)/userActivity';
import { H2, SafeAreaViewContainer, ScrollContainer } from '../../constants/GlobalStyles';


const UserActivity = () => {
    return (
        <SafeAreaViewContainer>
            <ScrollContainer>
                <H2>User Activity Logs</H2>
                <UserLogs />
            </ScrollContainer>
        </SafeAreaViewContainer>
    )
}

export default UserActivity